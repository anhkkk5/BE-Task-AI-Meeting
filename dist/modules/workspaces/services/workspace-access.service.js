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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceAccessService = void 0;
const common_1 = require("@nestjs/common");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_status_enum_1 = require("../../../common/enums/workspace-status.enum");
const workspace_members_repository_1 = require("../repositories/workspace-members.repository");
const workspaces_repository_1 = require("../repositories/workspaces.repository");
let WorkspaceAccessService = class WorkspaceAccessService {
    workspacesRepository;
    workspaceMembersRepository;
    constructor(workspacesRepository, workspaceMembersRepository) {
        this.workspacesRepository = workspacesRepository;
        this.workspaceMembersRepository = workspaceMembersRepository;
    }
    async getUserWorkspaceRole(userId, workspaceId) {
        const member = await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(workspaceId, userId);
        return member?.role ?? null;
    }
    async isWorkspaceMember(userId, workspaceId) {
        const role = await this.getUserWorkspaceRole(userId, workspaceId);
        return Boolean(role);
    }
    async assertWorkspaceMember(userId, workspaceId) {
        const member = await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(workspaceId, userId);
        if (!member) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        return member;
    }
    async assertWorkspaceOwner(userId, workspaceId) {
        const member = await this.assertWorkspaceMember(userId, workspaceId);
        if (member.role !== workspace_role_enum_1.WorkspaceRole.Owner) {
            throw new common_1.ForbiddenException('Only workspace owner can perform this action');
        }
        return member;
    }
    async assertWorkspaceActive(workspaceId) {
        const workspace = await this.workspacesRepository.findById(workspaceId);
        if (!workspace) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        if (workspace.status !== workspace_status_enum_1.WorkspaceStatus.Active) {
            throw new common_1.ForbiddenException('Workspace is archived');
        }
        return workspace;
    }
};
exports.WorkspaceAccessService = WorkspaceAccessService;
exports.WorkspaceAccessService = WorkspaceAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspaces_repository_1.WorkspacesRepository,
        workspace_members_repository_1.WorkspaceMembersRepository])
], WorkspaceAccessService);
//# sourceMappingURL=workspace-access.service.js.map