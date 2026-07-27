import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceStatus } from '../../../common/enums/workspace-status.enum';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
import { WorkspaceAccessService } from './workspace-access.service';

describe('WorkspaceAccessService', () => {
  let service: WorkspaceAccessService;
  let workspacesRepository: jest.Mocked<Pick<WorkspacesRepository, 'findById'>>;
  let workspaceMembersRepository: jest.Mocked<
    Pick<WorkspaceMembersRepository, 'findActiveByWorkspaceAndUser'>
  >;

  beforeEach(() => {
    workspacesRepository = {
      findById: jest.fn(),
    };
    workspaceMembersRepository = {
      findActiveByWorkspaceAndUser: jest.fn(),
    };
    service = new WorkspaceAccessService(
      workspacesRepository as unknown as WorkspacesRepository,
      workspaceMembersRepository as unknown as WorkspaceMembersRepository,
    );
  });

  it('returns user role in workspace', async () => {
    workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue({
      role: WorkspaceRole.Owner,
    } as never);

    await expect(
      service.getUserWorkspaceRole('user-id', 'workspace-id'),
    ).resolves.toBe(WorkspaceRole.Owner);
  });

  it('throws when user is not workspace member', async () => {
    workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue(
      null,
    );

    await expect(
      service.assertWorkspaceMember('user-id', 'workspace-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when user is not owner', async () => {
    workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue({
      role: WorkspaceRole.Member,
    } as never);

    await expect(
      service.assertWorkspaceOwner('user-id', 'workspace-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when workspace is archived', async () => {
    workspacesRepository.findById.mockResolvedValue({
      status: WorkspaceStatus.Archived,
    } as never);

    await expect(
      service.assertWorkspaceActive('workspace-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when workspace is missing', async () => {
    workspacesRepository.findById.mockResolvedValue(null);

    await expect(
      service.assertWorkspaceActive('workspace-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  describe('cache tu cach thanh vien', () => {
    const activeMember = {
      role: WorkspaceRole.Member,
      status: WorkspaceMemberStatus.Active,
    } as never;

    it('chi query DB mot lan cho nhieu lan doc lien tiep', async () => {
      workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue(
        activeMember,
      );

      await service.getMembershipSnapshot('user-id', 'workspace-id');
      await service.getMembershipSnapshot('user-id', 'workspace-id');
      await service.getMembershipSnapshot('user-id', 'workspace-id');

      expect(
        workspaceMembersRepository.findActiveByWorkspaceAndUser,
      ).toHaveBeenCalledTimes(1);
    });

    it('khong tron cache giua cac workspace hay nguoi dung khac nhau', async () => {
      workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue(
        activeMember,
      );

      await service.getMembershipSnapshot('user-a', 'workspace-1');
      await service.getMembershipSnapshot('user-b', 'workspace-1');
      await service.getMembershipSnapshot('user-a', 'workspace-2');

      expect(
        workspaceMembersRepository.findActiveByWorkspaceAndUser,
      ).toHaveBeenCalledTimes(3);
    });

    it('cache ca ket qua khong phai thanh vien', async () => {
      workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue(
        null,
      );

      await expect(
        service.assertWorkspaceMembership('user-id', 'workspace-id'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.assertWorkspaceMembership('user-id', 'workspace-id'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(
        workspaceMembersRepository.findActiveByWorkspaceAndUser,
      ).toHaveBeenCalledTimes(1);
    });

    it('doc lai DB sau khi cache bi xoa', async () => {
      workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue({
        role: WorkspaceRole.Owner,
        status: WorkspaceMemberStatus.Active,
      } as never);

      await service.getMembershipSnapshot('user-id', 'workspace-id');
      service.invalidateMembership('user-id', 'workspace-id');

      workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue(
        activeMember,
      );

      await expect(
        service.getUserWorkspaceRole('user-id', 'workspace-id'),
      ).resolves.toBe(WorkspaceRole.Member);
      expect(
        workspaceMembersRepository.findActiveByWorkspaceAndUser,
      ).toHaveBeenCalledTimes(2);
    });

    it('doc lai DB sau khi cache het han', async () => {
      jest.useFakeTimers();

      try {
        workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue(
          activeMember,
        );

        await service.getMembershipSnapshot('user-id', 'workspace-id');
        // Vuot qua TTL 15 giay de xac nhan quyen khong bi giu vo han.
        jest.advanceTimersByTime(20_000);
        await service.getMembershipSnapshot('user-id', 'workspace-id');

        expect(
          workspaceMembersRepository.findActiveByWorkspaceAndUser,
        ).toHaveBeenCalledTimes(2);
      } finally {
        jest.useRealTimers();
      }
    });

    it('khong dung cache cho entity dung o luong ghi', async () => {
      workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue({
        role: WorkspaceRole.Owner,
        status: WorkspaceMemberStatus.Active,
      } as never);

      await service.assertWorkspaceMember('user-id', 'workspace-id');
      await service.assertWorkspaceMember('user-id', 'workspace-id');

      expect(
        workspaceMembersRepository.findActiveByWorkspaceAndUser,
      ).toHaveBeenCalledTimes(2);
    });
  });
});
