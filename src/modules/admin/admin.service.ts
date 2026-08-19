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
import { ObservabilityService } from '../observability/observability.service';
import { randomUUID } from 'crypto';
import { createSlug } from '../../common/utils/slug.util';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly observability: ObservabilityService,
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

    const before = user.status;
    user.status =
      user.status === UserStatus.Active ? UserStatus.Inactive : UserStatus.Active;
    await this.userRepo.save(user);
    await this.observability.audit({ actorId: adminId, action: user.status === UserStatus.Active ? 'USER_ENABLED' : 'USER_DISABLED', targetType: 'USER', targetId: user.id, before: { status: before }, after: { status: user.status }, metadata: null });

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

    const before = user.isSystemAdmin;
    user.isSystemAdmin = !user.isSystemAdmin;
    await this.userRepo.save(user);
    await this.observability.audit({ actorId: adminId, action: user.isSystemAdmin ? 'ADMIN_GRANTED' : 'ADMIN_REVOKED', targetType: 'USER', targetId: user.id, before: { isSystemAdmin: before }, after: { isSystemAdmin: user.isSystemAdmin }, metadata: null });

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
         AND status = 'ACTIVE'
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

  async toggleWorkspaceStatus(adminId: string, workspaceId: string) {
    const ws = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');

    const before = ws.status;
    ws.status =
      ws.status === WorkspaceStatus.Active
        ? WorkspaceStatus.Archived
        : WorkspaceStatus.Active;
    await this.workspaceRepo.save(ws);
    await this.observability.audit({ actorId: adminId, action: ws.status === WorkspaceStatus.Active ? 'WORKSPACE_RESTORED' : 'WORKSPACE_ARCHIVED', targetType: 'WORKSPACE', targetId: ws.id, before: { status: before }, after: { status: ws.status }, metadata: { name: ws.name } });

    return {
      success: true,
      message: `Workspace đã được ${ws.status === WorkspaceStatus.Active ? 'kích hoạt' : 'lưu trữ'}.`,
      data: { id: ws.id, status: ws.status },
    };
  }

  async getWorkspaceDetail(workspaceId: string) {
    const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');
    const [owners, members, projects, totals] = await Promise.all([
      this.dataSource.query('SELECT id,email,full_name,avatar_url,job_title FROM users WHERE id=? LIMIT 1', [workspace.ownerId]),
      this.dataSource.query(`SELECT wm.id,wm.user_id userId,wm.role,wm.status,wm.joined_at joinedAt,u.full_name fullName,u.email,u.avatar_url avatarUrl,u.job_title jobTitle FROM workspace_members wm JOIN users u ON u.id=wm.user_id WHERE wm.workspace_id=? ORDER BY FIELD(wm.role,'OWNER','PROJECT_MANAGER','SCRUM_MASTER','MEMBER','VIEWER'),wm.created_at`, [workspaceId]),
      this.dataSource.query(`SELECT p.id,p.name,p.key_code keyCode,p.status,p.created_by createdBy,p.created_at createdAt,u.full_name creatorName,(SELECT COUNT(*) FROM sprints s WHERE s.project_id=p.id AND s.deleted_at IS NULL) sprintCount,(SELECT COUNT(*) FROM tasks t WHERE t.project_id=p.id AND t.deleted_at IS NULL) taskCount FROM projects p LEFT JOIN users u ON u.id=p.created_by WHERE p.workspace_id=? AND p.deleted_at IS NULL ORDER BY p.created_at DESC`, [workspaceId]),
      this.dataSource.query(`SELECT (SELECT COUNT(*) FROM workspace_members WHERE workspace_id=? AND status='ACTIVE') memberCount,(SELECT COUNT(*) FROM projects WHERE workspace_id=? AND deleted_at IS NULL) projectCount,(SELECT COUNT(*) FROM sprints s JOIN projects p ON p.id=s.project_id WHERE p.workspace_id=? AND s.deleted_at IS NULL) sprintCount,(SELECT COUNT(*) FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.workspace_id=? AND t.deleted_at IS NULL) taskCount`, [workspaceId, workspaceId, workspaceId, workspaceId]),
    ]);
    return { success: true, message: 'Success', data: { workspace: { ...workspace, owner: owners[0] ?? null }, members, projects, totals: totals[0] } };
  }

  async createWorkspace(adminId: string, dto: { name: string; description?: string; ownerId?: string }) {
    const name = dto.name?.trim();
    if (!name) throw new NotFoundException('Workspace name is required');
    const ownerId = dto.ownerId || adminId;
    const owner = await this.userRepo.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Owner not found');
    const base = createSlug(name) || 'workspace'; let slug = base; let suffix = 1;
    while (await this.workspaceRepo.findOne({ where: { slug } })) slug = `${base}-${++suffix}`;
    const id = randomUUID();
    await this.dataSource.transaction(async (manager) => {
      await manager.query(`INSERT INTO workspaces (id,name,slug,description,owner_id,plan,status,created_at,updated_at) VALUES (?,?,?,?,?,'FREE','ACTIVE',NOW(),NOW())`, [id, name, slug, dto.description?.trim() || null, ownerId]);
      await manager.query(`INSERT INTO workspace_members (id,workspace_id,user_id,role,status,joined_at,daily_capacity_hours,unavailable_dates,created_at,updated_at) VALUES (?,?,?,'OWNER','ACTIVE',NOW(),8,JSON_ARRAY(),NOW(),NOW())`, [randomUUID(), id, ownerId]);
    });
    await this.observability.audit({ actorId: adminId, action: 'WORKSPACE_CREATED', targetType: 'WORKSPACE', targetId: id, before: null, after: { name, ownerId }, metadata: null });
    return this.getWorkspaceDetail(id);
  }

  async updateWorkspace(adminId: string, workspaceId: string, dto: { name?: string; description?: string; plan?: string }) {
    const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');
    const before = { name: workspace.name, description: workspace.description, plan: workspace.plan };
    if (dto.name?.trim()) workspace.name = dto.name.trim();
    if (dto.description !== undefined) workspace.description = dto.description.trim() || null;
    if (dto.plan && ['FREE', 'PRO', 'ENTERPRISE'].includes(dto.plan)) workspace.plan = dto.plan as typeof workspace.plan;
    await this.workspaceRepo.save(workspace);
    await this.observability.audit({ actorId: adminId, action: 'WORKSPACE_UPDATED', targetType: 'WORKSPACE', targetId: workspaceId, before, after: { name: workspace.name, description: workspace.description, plan: workspace.plan }, metadata: null });
    return this.getWorkspaceDetail(workspaceId);
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
