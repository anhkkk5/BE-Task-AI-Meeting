import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserStatus } from '../users/enums/user-status.enum';
import { User } from '../users/entities/user.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { WorkspaceStatus } from '../../common/enums/workspace-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ===== SYSTEM STATS =====
  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalWorkspaces,
      activeWorkspaces,
    ] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { status: UserStatus.Active } }),
      this.userRepo.count({ where: { isSystemAdmin: true } }),
      this.workspaceRepo.count(),
      this.workspaceRepo.count({ where: { status: WorkspaceStatus.Active } }),
    ]);

    // Lấy số dự án và task từ raw SQL để tránh import thêm nhiều entity
    const [projectCount, taskCount, meetingCount] = await Promise.all([
      this.dataSource.query('SELECT COUNT(*) as cnt FROM projects'),
      this.dataSource.query('SELECT COUNT(*) as cnt FROM tasks'),
      this.dataSource.query('SELECT COUNT(*) as cnt FROM meetings'),
    ]);

    // Users mới trong 30 ngày
    const recentUsers = await this.dataSource.query(
      'SELECT COUNT(*) as cnt FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
    );

    // Workspaces mới trong 30 ngày
    const recentWorkspaces = await this.dataSource.query(
      'SELECT COUNT(*) as cnt FROM workspaces WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
    );

    return {
      success: true,
      message: 'Success',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          admins: adminUsers,
          newLast30Days: Number((recentUsers[0] as { cnt: string }).cnt),
        },
        workspaces: {
          total: totalWorkspaces,
          active: activeWorkspaces,
          archived: totalWorkspaces - activeWorkspaces,
          newLast30Days: Number(
            (recentWorkspaces[0] as { cnt: string }).cnt,
          ),
        },
        projects: {
          total: Number((projectCount[0] as { cnt: string }).cnt),
        },
        tasks: {
          total: Number((taskCount[0] as { cnt: string }).cnt),
        },
        meetings: {
          total: Number((meetingCount[0] as { cnt: string }).cnt),
        },
      },
    };
  }

  // ===== USERS =====
  async getAllUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.userRepo.createQueryBuilder('user');

    if (query.search) {
      qb.andWhere(
        '(user.fullName LIKE :search OR user.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status === 'active') {
      qb.andWhere('user.status = :status', { status: UserStatus.Active });
    } else if (query.status === 'inactive') {
      qb.andWhere('user.status = :status', { status: UserStatus.Inactive });
    } else if (query.status === 'admin') {
      qb.andWhere('user.isSystemAdmin = :isAdmin', { isAdmin: true });
    }

    qb.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Success',
      data: {
        items: items.map((u) => this.toUserResponse(u)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async toggleUserStatus(adminId: string, targetUserId: string) {
    if (adminId === targetUserId) {
      throw new ForbiddenException('Không thể tự vô hiệu hóa tài khoản của chính mình.');
    }

    const user = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    user.status =
      user.status === UserStatus.Active ? UserStatus.Inactive : UserStatus.Active;
    await this.userRepo.save(user);

    return {
      success: true,
      message: `Tài khoản đã được ${user.status === UserStatus.Active ? 'kích hoạt' : 'vô hiệu hóa'}.`,
      data: this.toUserResponse(user),
    };
  }

  async toggleAdminRole(adminId: string, targetUserId: string) {
    if (adminId === targetUserId) {
      throw new ForbiddenException('Không thể thay đổi quyền admin của chính mình.');
    }

    const user = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    user.isSystemAdmin = !user.isSystemAdmin;
    await this.userRepo.save(user);

    return {
      success: true,
      message: `Quyền System Admin đã được ${user.isSystemAdmin ? 'cấp' : 'thu hồi'}.`,
      data: this.toUserResponse(user),
    };
  }

  // ===== WORKSPACES =====
  async getAllWorkspaces(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const qb = this.workspaceRepo.createQueryBuilder('ws');

    if (query.search) {
      qb.andWhere(
        '(ws.name LIKE :search OR ws.slug LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status === 'active') {
      qb.andWhere('ws.status = :status', { status: WorkspaceStatus.Active });
    } else if (query.status === 'archived') {
      qb.andWhere('ws.status = :status', { status: WorkspaceStatus.Archived });
    }

    qb.orderBy('ws.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    // Lấy member count cho từng workspace
    const memberCounts = await this.dataSource.query(
      `SELECT workspace_id, COUNT(*) as cnt 
       FROM workspace_members 
       WHERE workspace_id IN (${items.map((w) => `'${w.id}'`).join(',') || "''"}) 
         AND status = 'active'
       GROUP BY workspace_id`,
    );
    const countMap = new Map<string, number>(
      (memberCounts as { workspace_id: string; cnt: string }[]).map((r) => [
        r.workspace_id,
        Number(r.cnt),
      ]),
    );

    return {
      success: true,
      message: 'Success',
      data: {
        items: items.map((ws) => ({
          id: ws.id,
          name: ws.name,
          slug: ws.slug,
          description: ws.description,
          plan: ws.plan,
          status: ws.status,
          ownerId: ws.ownerId,
          memberCount: countMap.get(ws.id) ?? 0,
          createdAt: ws.createdAt,
          updatedAt: ws.updatedAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async toggleWorkspaceStatus(workspaceId: string) {
    const ws = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');

    ws.status =
      ws.status === WorkspaceStatus.Active
        ? WorkspaceStatus.Archived
        : WorkspaceStatus.Active;
    await this.workspaceRepo.save(ws);

    return {
      success: true,
      message: `Workspace đã được ${ws.status === WorkspaceStatus.Active ? 'kích hoạt' : 'lưu trữ'}.`,
      data: { id: ws.id, status: ws.status },
    };
  }

  // ===== HELPERS =====
  private toUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      jobTitle: user.jobTitle,
      status: user.status,
      isSystemAdmin: user.isSystemAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
