"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_status_enum_1 = require("../users/enums/user-status.enum");
const user_entity_1 = require("../users/entities/user.entity");
const workspace_entity_1 = require("../workspaces/entities/workspace.entity");
const workspace_status_enum_1 = require("../../common/enums/workspace-status.enum");
const observability_service_1 = require("../observability/observability.service");
const crypto_1 = require("crypto");
const slug_util_1 = require("../../common/utils/slug.util");
let AdminService = class AdminService {
    userRepo;
    workspaceRepo;
    dataSource;
    observability;
    constructor(userRepo, workspaceRepo, dataSource, observability) {
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
        this.dataSource = dataSource;
        this.observability = observability;
    }
    async getSystemStats() {
        const [totalUsers, activeUsers, adminUsers, totalWorkspaces, activeWorkspaces,] = await Promise.all([
            this.userRepo.count(),
            this.userRepo.count({ where: { status: user_status_enum_1.UserStatus.Active } }),
            this.userRepo.count({ where: { isSystemAdmin: true } }),
            this.workspaceRepo.count(),
            this.workspaceRepo.count({ where: { status: workspace_status_enum_1.WorkspaceStatus.Active } }),
        ]);
        const [projectCount, taskCount, meetingCount] = await Promise.all([
            this.dataSource.query('SELECT COUNT(*) as cnt FROM projects'),
            this.dataSource.query('SELECT COUNT(*) as cnt FROM tasks'),
            this.dataSource.query('SELECT COUNT(*) as cnt FROM meetings'),
        ]);
        const recentUsers = await this.dataSource.query('SELECT COUNT(*) as cnt FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
        const recentWorkspaces = await this.dataSource.query('SELECT COUNT(*) as cnt FROM workspaces WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
        return {
            success: true,
            message: 'Success',
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: totalUsers - activeUsers,
                    admins: adminUsers,
                    newLast30Days: Number(recentUsers[0].cnt),
                },
                workspaces: {
                    total: totalWorkspaces,
                    active: activeWorkspaces,
                    archived: totalWorkspaces - activeWorkspaces,
                    newLast30Days: Number(recentWorkspaces[0].cnt),
                },
                projects: {
                    total: Number(projectCount[0].cnt),
                },
                tasks: {
                    total: Number(taskCount[0].cnt),
                },
                meetings: {
                    total: Number(meetingCount[0].cnt),
                },
            },
        };
    }
    async getAllUsers(query) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, Math.max(1, query.limit ?? 20));
        const skip = (page - 1) * limit;
        const qb = this.userRepo.createQueryBuilder('user');
        if (query.search) {
            qb.andWhere('(user.fullName LIKE :search OR user.email LIKE :search)', { search: `%${query.search}%` });
        }
        if (query.status === 'active') {
            qb.andWhere('user.status = :status', { status: user_status_enum_1.UserStatus.Active });
        }
        else if (query.status === 'inactive') {
            qb.andWhere('user.status = :status', { status: user_status_enum_1.UserStatus.Inactive });
        }
        else if (query.status === 'admin') {
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
    async toggleUserStatus(adminId, targetUserId) {
        if (adminId === targetUserId) {
            throw new common_1.ForbiddenException('Không thể tự vô hiệu hóa tài khoản của chính mình.');
        }
        const user = await this.userRepo.findOne({ where: { id: targetUserId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const before = user.status;
        user.status =
            user.status === user_status_enum_1.UserStatus.Active ? user_status_enum_1.UserStatus.Inactive : user_status_enum_1.UserStatus.Active;
        await this.userRepo.save(user);
        await this.observability.audit({ actorId: adminId, action: user.status === user_status_enum_1.UserStatus.Active ? 'USER_ENABLED' : 'USER_DISABLED', targetType: 'USER', targetId: user.id, before: { status: before }, after: { status: user.status }, metadata: null });
        return {
            success: true,
            message: `Tài khoản đã được ${user.status === user_status_enum_1.UserStatus.Active ? 'kích hoạt' : 'vô hiệu hóa'}.`,
            data: this.toUserResponse(user),
        };
    }
    async toggleAdminRole(adminId, targetUserId) {
        if (adminId === targetUserId) {
            throw new common_1.ForbiddenException('Không thể thay đổi quyền admin của chính mình.');
        }
        const user = await this.userRepo.findOne({ where: { id: targetUserId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
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
    async getAllWorkspaces(query) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, Math.max(1, query.limit ?? 20));
        const skip = (page - 1) * limit;
        const qb = this.workspaceRepo.createQueryBuilder('ws');
        if (query.search) {
            qb.andWhere('(ws.name LIKE :search OR ws.slug LIKE :search)', { search: `%${query.search}%` });
        }
        if (query.status === 'active') {
            qb.andWhere('ws.status = :status', { status: workspace_status_enum_1.WorkspaceStatus.Active });
        }
        else if (query.status === 'archived') {
            qb.andWhere('ws.status = :status', { status: workspace_status_enum_1.WorkspaceStatus.Archived });
        }
        qb.orderBy('ws.createdAt', 'DESC').skip(skip).take(limit);
        const [items, total] = await qb.getManyAndCount();
        const memberCounts = await this.dataSource.query(`SELECT workspace_id, COUNT(*) as cnt 
       FROM workspace_members 
       WHERE workspace_id IN (${items.map((w) => `'${w.id}'`).join(',') || "''"}) 
         AND status = 'ACTIVE'
       GROUP BY workspace_id`);
        const countMap = new Map(memberCounts.map((r) => [
            r.workspace_id,
            Number(r.cnt),
        ]));
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
    async toggleWorkspaceStatus(adminId, workspaceId) {
        const ws = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
        if (!ws)
            throw new common_1.NotFoundException('Workspace not found');
        const before = ws.status;
        ws.status =
            ws.status === workspace_status_enum_1.WorkspaceStatus.Active
                ? workspace_status_enum_1.WorkspaceStatus.Archived
                : workspace_status_enum_1.WorkspaceStatus.Active;
        await this.workspaceRepo.save(ws);
        await this.observability.audit({ actorId: adminId, action: ws.status === workspace_status_enum_1.WorkspaceStatus.Active ? 'WORKSPACE_RESTORED' : 'WORKSPACE_ARCHIVED', targetType: 'WORKSPACE', targetId: ws.id, before: { status: before }, after: { status: ws.status }, metadata: { name: ws.name } });
        return {
            success: true,
            message: `Workspace đã được ${ws.status === workspace_status_enum_1.WorkspaceStatus.Active ? 'kích hoạt' : 'lưu trữ'}.`,
            data: { id: ws.id, status: ws.status },
        };
    }
    async getWorkspaceDetail(workspaceId) {
        const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
        if (!workspace)
            throw new common_1.NotFoundException('Workspace not found');
        const [owners, members, projects, totals] = await Promise.all([
            this.dataSource.query('SELECT id,email,full_name,avatar_url,job_title FROM users WHERE id=? LIMIT 1', [workspace.ownerId]),
            this.dataSource.query(`SELECT wm.id,wm.user_id userId,wm.role,wm.status,wm.joined_at joinedAt,u.full_name fullName,u.email,u.avatar_url avatarUrl,u.job_title jobTitle FROM workspace_members wm JOIN users u ON u.id=wm.user_id WHERE wm.workspace_id=? ORDER BY FIELD(wm.role,'OWNER','PROJECT_MANAGER','SCRUM_MASTER','MEMBER','VIEWER'),wm.created_at`, [workspaceId]),
            this.dataSource.query(`SELECT p.id,p.name,p.key_code keyCode,p.status,p.created_by createdBy,p.created_at createdAt,u.full_name creatorName,(SELECT COUNT(*) FROM sprints s WHERE s.project_id=p.id AND s.deleted_at IS NULL) sprintCount,(SELECT COUNT(*) FROM tasks t WHERE t.project_id=p.id AND t.deleted_at IS NULL) taskCount FROM projects p LEFT JOIN users u ON u.id=p.created_by WHERE p.workspace_id=? AND p.deleted_at IS NULL ORDER BY p.created_at DESC`, [workspaceId]),
            this.dataSource.query(`SELECT (SELECT COUNT(*) FROM workspace_members WHERE workspace_id=? AND status='ACTIVE') memberCount,(SELECT COUNT(*) FROM projects WHERE workspace_id=? AND deleted_at IS NULL) projectCount,(SELECT COUNT(*) FROM sprints s JOIN projects p ON p.id=s.project_id WHERE p.workspace_id=? AND s.deleted_at IS NULL) sprintCount,(SELECT COUNT(*) FROM tasks t JOIN projects p ON p.id=t.project_id WHERE p.workspace_id=? AND t.deleted_at IS NULL) taskCount`, [workspaceId, workspaceId, workspaceId, workspaceId]),
        ]);
        return { success: true, message: 'Success', data: { workspace: { ...workspace, owner: owners[0] ?? null }, members, projects, totals: totals[0] } };
    }
    async createWorkspace(adminId, dto) {
        const name = dto.name?.trim();
        if (!name)
            throw new common_1.NotFoundException('Workspace name is required');
        const ownerId = dto.ownerId || adminId;
        const owner = await this.userRepo.findOne({ where: { id: ownerId } });
        if (!owner)
            throw new common_1.NotFoundException('Owner not found');
        const base = (0, slug_util_1.createSlug)(name) || 'workspace';
        let slug = base;
        let suffix = 1;
        while (await this.workspaceRepo.findOne({ where: { slug } }))
            slug = `${base}-${++suffix}`;
        const id = (0, crypto_1.randomUUID)();
        await this.dataSource.transaction(async (manager) => {
            await manager.query(`INSERT INTO workspaces (id,name,slug,description,owner_id,plan,status,created_at,updated_at) VALUES (?,?,?,?,?,'FREE','ACTIVE',NOW(),NOW())`, [id, name, slug, dto.description?.trim() || null, ownerId]);
            await manager.query(`INSERT INTO workspace_members (id,workspace_id,user_id,role,status,joined_at,daily_capacity_hours,unavailable_dates,created_at,updated_at) VALUES (?,?,?,'OWNER','ACTIVE',NOW(),8,JSON_ARRAY(),NOW(),NOW())`, [(0, crypto_1.randomUUID)(), id, ownerId]);
        });
        await this.observability.audit({ actorId: adminId, action: 'WORKSPACE_CREATED', targetType: 'WORKSPACE', targetId: id, before: null, after: { name, ownerId }, metadata: null });
        return this.getWorkspaceDetail(id);
    }
    async updateWorkspace(adminId, workspaceId, dto) {
        const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
        if (!workspace)
            throw new common_1.NotFoundException('Workspace not found');
        const before = { name: workspace.name, description: workspace.description, plan: workspace.plan };
        if (dto.name?.trim())
            workspace.name = dto.name.trim();
        if (dto.description !== undefined)
            workspace.description = dto.description.trim() || null;
        if (dto.plan && ['FREE', 'PRO', 'ENTERPRISE'].includes(dto.plan))
            workspace.plan = dto.plan;
        await this.workspaceRepo.save(workspace);
        await this.observability.audit({ actorId: adminId, action: 'WORKSPACE_UPDATED', targetType: 'WORKSPACE', targetId: workspaceId, before, after: { name: workspace.name, description: workspace.description, plan: workspace.plan }, metadata: null });
        return this.getWorkspaceDetail(workspaceId);
    }
    toUserResponse(user) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(workspace_entity_1.Workspace)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        observability_service_1.ObservabilityService])
], AdminService);
//# sourceMappingURL=admin.service.js.map