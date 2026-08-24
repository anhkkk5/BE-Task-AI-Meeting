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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const create_project_dto_1 = require("../dto/create-project.dto");
const get_projects_query_dto_1 = require("../dto/get-projects-query.dto");
const update_project_dto_1 = require("../dto/update-project.dto");
const projects_service_1 = require("../services/projects.service");
const projectWriteRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    listWorkflowTemplates(user, workspaceId) {
        return this.projectsService.listWorkflowTemplates(user.id, workspaceId);
    }
    createWorkflowTemplate(user, workspaceId, dto) {
        return this.projectsService.createWorkflowTemplate(user.id, workspaceId, dto);
    }
    updateWorkflowTemplate(user, workspaceId, templateId, dto) {
        return this.projectsService.updateWorkflowTemplate(user.id, workspaceId, templateId, dto);
    }
    deleteWorkflowTemplate(user, workspaceId, templateId) {
        return this.projectsService.deleteWorkflowTemplate(user.id, workspaceId, templateId);
    }
    applyWorkflowTemplate(user, workspaceId, projectId, templateId) {
        return this.projectsService.applyWorkflowTemplate(user.id, workspaceId, projectId, templateId);
    }
    createProject(user, workspaceId, dto) {
        return this.projectsService.createProject(user.id, workspaceId, dto);
    }
    getProjects(user, workspaceId, query) {
        return this.projectsService.getProjects(user.id, workspaceId, query);
    }
    getProjectDetail(user, workspaceId, projectId) {
        return this.projectsService.getProjectDetail(user.id, workspaceId, projectId);
    }
    updateProject(user, workspaceId, projectId, dto) {
        return this.projectsService.updateProject(user.id, workspaceId, projectId, dto);
    }
    archiveProject(user, workspaceId, projectId) {
        return this.projectsService.archiveProject(user.id, workspaceId, projectId);
    }
    completeProject(user, workspaceId, projectId) {
        return this.projectsService.completeProject(user.id, workspaceId, projectId);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)('workflow-templates'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "listWorkflowTemplates", null);
__decorate([
    (0, common_1.Post)('workflow-templates'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...projectWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "createWorkflowTemplate", null);
__decorate([
    (0, common_1.Patch)('workflow-templates/:templateId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...projectWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('templateId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateWorkflowTemplate", null);
__decorate([
    (0, common_1.Delete)('workflow-templates/:templateId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...projectWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "deleteWorkflowTemplate", null);
__decorate([
    (0, common_1.Patch)(':projectId/workflow-template/:templateId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...projectWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "applyWorkflowTemplate", null);
__decorate([
    (0, common_1.Post)(),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...projectWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Create project',
        description: 'OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao project.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Create project successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workspace projects',
        description: 'Member ACTIVE nao cung xem duoc project trong workspace.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, get_projects_query_dto_1.GetProjectsQueryDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)(':projectId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get project detail',
        description: 'Chi member cua workspace moi xem duoc project detail.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "getProjectDetail", null);
__decorate([
    (0, common_1.Patch)(':projectId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...projectWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Update project',
        description: 'Khong cho sua keyCode/status/workspaceId/createdBy.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateProject", null);
__decorate([
    (0, common_1.Patch)(':projectId/archive'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...projectWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Archive project',
        description: 'Archive bang cach set status = ARCHIVED, khong hard delete.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "archiveProject", null);
__decorate([
    (0, common_1.Patch)(':projectId/complete'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...projectWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete project',
        description: 'Danh dau project da hoan thanh.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "completeProject", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects'),
    (0, swagger_1.ApiTags)('Projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map