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
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const slug_util_1 = require("../../../common/utils/slug.util");
const workspace_members_repository_1 = require("../repositories/workspace-members.repository");
const workspaces_repository_1 = require("../repositories/workspaces.repository");
const workspace_access_service_1 = require("./workspace-access.service");
let WorkspacesService = class WorkspacesService {
    dataSource;
    workspacesRepository;
    workspaceMembersRepository;
    workspaceAccessService;
    constructor(dataSource, workspacesRepository, workspaceMembersRepository, workspaceAccessService) {
        this.dataSource = dataSource;
        this.workspacesRepository = workspacesRepository;
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.workspaceAccessService = workspaceAccessService;
    }
    async createWorkspace(userId, dto) {
        const name = dto.name.trim();
        const description = dto.description?.trim() || null;
        const slug = await this.createUniqueSlug(name);
        const workspace = await this.dataSource.transaction(async (manager) => {
            const createdWorkspace = await this.workspacesRepository.create({
                name,
                slug,
                description,
                ownerId: userId,
            }, manager);
            await this.workspaceMembersRepository.createOwnerMember({
                workspaceId: createdWorkspace.id,
                userId,
            }, manager);
            return createdWorkspace;
        });
        return {
            success: true,
            message: 'Create workspace successfully',
            data: {
                workspace: this.toWorkspaceResponse(workspace),
            },
        };
    }
    async getMyWorkspaces(userId, query) {
        const members = await this.workspaceMembersRepository.findActiveByUser(userId, query.status);
        return {
            success: true,
            message: 'Get workspaces successfully',
            data: {
                items: members.map((member) => ({
                    ...this.toWorkspaceResponse(member.workspace),
                    role: member.role,
                })),
            },
        };
    }
    async getWorkspaceDetail(userId, workspaceId) {
        const member = await this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
        const workspace = await this.findWorkspaceOrFail(workspaceId);
        return {
            success: true,
            message: 'Get workspace detail successfully',
            data: {
                workspace: {
                    ...this.toWorkspaceResponse(workspace),
                    myRole: member.role,
                    updatedAt: workspace.updatedAt,
                },
            },
        };
    }
    async updateWorkspace(userId, workspaceId, dto) {
        await this.workspaceAccessService.assertWorkspaceOwner(userId, workspaceId);
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        const workspace = await this.workspacesRepository.update(workspaceId, {
            name: dto.name?.trim(),
            description: dto.description === undefined
                ? undefined
                : dto.description.trim() || null,
        });
        if (!workspace) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        return {
            success: true,
            message: 'Update workspace successfully',
            data: {
                workspace: this.toWorkspaceResponse(workspace),
            },
        };
    }
    async archiveWorkspace(userId, workspaceId) {
        await this.workspaceAccessService.assertWorkspaceOwner(userId, workspaceId);
        await this.findWorkspaceOrFail(workspaceId);
        await this.workspacesRepository.archive(workspaceId);
        return {
            success: true,
            message: 'Archive workspace successfully',
            data: null,
        };
    }
    async createUniqueSlug(name) {
        const baseSlug = (0, slug_util_1.createSlug)(name) || 'workspace';
        let slug = baseSlug;
        let suffix = 1;
        while (await this.workspacesRepository.findBySlug(slug)) {
            suffix += 1;
            slug = `${baseSlug}-${suffix}`;
        }
        return slug;
    }
    async findWorkspaceOrFail(workspaceId) {
        const workspace = await this.workspacesRepository.findById(workspaceId);
        if (!workspace) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        return workspace;
    }
    toWorkspaceResponse(workspace) {
        return {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            description: workspace.description,
            ownerId: workspace.ownerId,
            plan: workspace.plan,
            status: workspace.status,
            createdAt: workspace.createdAt,
            updatedAt: workspace.updatedAt,
        };
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        workspaces_repository_1.WorkspacesRepository,
        workspace_members_repository_1.WorkspaceMembersRepository,
        workspace_access_service_1.WorkspaceAccessService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map