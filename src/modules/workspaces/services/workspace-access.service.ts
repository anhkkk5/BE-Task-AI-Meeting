import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceStatus } from '../../../common/enums/workspace-status.enum';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';

/**
 * Ban rut gon cua mot tu cach thanh vien, chi giu nhung gi can de xet quyen.
 *
 * Co tinh KHONG cache ca entity WorkspaceMember: entity duoc dua vao
 * `repository.save()` o cac luong ghi, va mot doi tuong da mat metadata cua
 * TypeORM co the sinh ra insert thay vi update. Snapshot nay chi dung cho viec
 * doc quyen.
 */
type MembershipSnapshot = {
  role: WorkspaceRole;
  status: WorkspaceMemberStatus;
};

type CacheEntry = {
  snapshot: MembershipSnapshot | null;
  expiresAt: number;
};

/**
 * Thoi gian song cua cache tu cach thanh vien.
 *
 * Chu dich la ngan. Muc dich khong phai giu quyen lau, ma la gom cac request
 * song song cua CUNG mot lan mo trang (frontend ban 5-6 request mot luc, moi
 * request lai qua guard kiem tra quyen) vao mot query duy nhat.
 *
 * Doi lai, nguoi bi ha quyen co the giu quyen cu toi da bang khoang thoi gian
 * nay neu invalidateMembership khong duoc goi.
 */
const MEMBERSHIP_CACHE_TTL_MS = 15_000;

/** Chan so ban ghi trong cache de mot server chay lau khong phinh bo nho. */
const MEMBERSHIP_CACHE_MAX_ENTRIES = 5_000;

@Injectable()
export class WorkspaceAccessService {
  /**
   * Cache nam trong bo nho tien trinh, khong dung Redis.
   *
   * Ca MySQL va Redis deu la dich vu tu xa, nen cache qua Redis chi doi mot vong
   * mang lay mot vong mang khac. Cache trong bo nho thi khong ton vong mang nao
   * va khong ton ket noi DB — dieu nay quan trong vi goi DB dang dung chi cho
   * phep rat it ket noi dong thoi.
   *
   * Danh doi: cache theo tung tien trinh. Neu chay nhieu instance, viec xoa cache
   * chi tac dung tren instance nhan request do; cac instance khac se tu het han
   * sau TTL o tren.
   */
  private readonly membershipCache = new Map<string, CacheEntry>();

  constructor(
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
  ) {}

  /**
   * Doc tu cach thanh vien, uu tien cache.
   */
  async getMembershipSnapshot(
    userId: string,
    workspaceId: string,
  ): Promise<MembershipSnapshot | null> {
    const cacheKey = this.buildMembershipCacheKey(userId, workspaceId);
    const cached = this.membershipCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.snapshot;
    }

    const member =
      await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(
        workspaceId,
        userId,
      );

    const snapshot: MembershipSnapshot | null = member
      ? { role: member.role, status: member.status }
      : null;

    this.writeCache(cacheKey, snapshot);

    return snapshot;
  }

  async getUserWorkspaceRole(userId: string, workspaceId: string) {
    const snapshot = await this.getMembershipSnapshot(userId, workspaceId);

    return snapshot?.role ?? null;
  }

  async isWorkspaceMember(userId: string, workspaceId: string) {
    const role = await this.getUserWorkspaceRole(userId, workspaceId);

    return Boolean(role);
  }

  /**
   * Dung cho guard: chi can biet co phai thanh vien hay khong, khong can entity.
   * Nho do guard doc duoc tu cache thay vi query moi request.
   */
  async assertWorkspaceMembership(userId: string, workspaceId: string) {
    const snapshot = await this.getMembershipSnapshot(userId, workspaceId);

    if (!snapshot) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return snapshot;
  }

  /**
   * Tra ve entity that su tu DB, khong qua cache.
   *
   * Cac luong ghi can entity con nguyen metadata cua TypeORM de `save()` hoat
   * dong dung, nen ham nay co tinh khong dung cache.
   */
  async assertWorkspaceMember(userId: string, workspaceId: string) {
    const member =
      await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(
        workspaceId,
        userId,
      );

    if (!member) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return member;
  }

  async assertWorkspaceOwner(userId: string, workspaceId: string) {
    const member = await this.assertWorkspaceMember(userId, workspaceId);

    if (member.role !== WorkspaceRole.Owner) {
      throw new ForbiddenException(
        'Only workspace owner can perform this action',
      );
    }

    return member;
  }

  async assertWorkspaceActive(workspaceId: string) {
    const workspace = await this.workspacesRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.status !== WorkspaceStatus.Active) {
      throw new ForbiddenException('Workspace is archived');
    }

    return workspace;
  }

  /**
   * Xoa cache tu cach thanh vien.
   *
   * PHAI goi sau moi thay doi ve thanh vien (them, doi role, xoa), neu khong
   * nguoi dung se giu quyen cu cho den khi cache het han.
   */
  invalidateMembership(userId: string, workspaceId: string) {
    this.membershipCache.delete(
      this.buildMembershipCacheKey(userId, workspaceId),
    );
  }

  private buildMembershipCacheKey(userId: string, workspaceId: string) {
    return `${workspaceId}:${userId}`;
  }

  private writeCache(cacheKey: string, snapshot: MembershipSnapshot | null) {
    if (this.membershipCache.size >= MEMBERSHIP_CACHE_MAX_ENTRIES) {
      this.evictExpiredEntries();
    }

    this.membershipCache.set(cacheKey, {
      snapshot,
      expiresAt: Date.now() + MEMBERSHIP_CACHE_TTL_MS,
    });
  }

  /**
   * Don cac ban ghi da het han. Neu don xong van con day thi xoa het, vi giu lai
   * mot phan tuy y khong tot hon la bat dau lai.
   */
  private evictExpiredEntries() {
    const now = Date.now();

    for (const [key, entry] of this.membershipCache) {
      if (entry.expiresAt <= now) {
        this.membershipCache.delete(key);
      }
    }

    if (this.membershipCache.size >= MEMBERSHIP_CACHE_MAX_ENTRIES) {
      this.membershipCache.clear();
    }
  }
}
