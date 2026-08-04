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
let AdminService = class AdminService {
    userRepo;
    workspaceRepo;
    dataSource;
    constructor(userRepo, workspaceRepo, dataSource) {
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
        this.dataSource = dataSource;
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
        user.status =
            user.status === user_status_enum_1.UserStatus.Active ? user_status_enum_1.UserStatus.Inactive : user_status_enum_1.UserStatus.Active;
        await this.userRepo.save(user);
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
        user.isSystemAdmin = !user.isSystemAdmin;
        await this.userRepo.save(user);
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
         AND status = 'active'
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
    async toggleWorkspaceStatus(workspaceId) {
        const ws = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
        if (!ws)
            throw new common_1.NotFoundException('Workspace not found');
        ws.status =
            ws.status === workspace_status_enum_1.WorkspaceStatus.Active
                ? workspace_status_enum_1.WorkspaceStatus.Archived
                : workspace_status_enum_1.WorkspaceStatus.Active;
        await this.workspaceRepo.save(ws);
        return {
            success: true,
            message: `Workspace đã được ${ws.status === workspace_status_enum_1.WorkspaceStatus.Active ? 'kích hoạt' : 'lưu trữ'}.`,
            data: { id: ws.id, status: ws.status },
        };
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
        typeorm_2.DataSource])
], AdminService);
//# sourceMappingURL=admin.service.js.map