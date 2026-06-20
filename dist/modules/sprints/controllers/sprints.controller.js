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
exports.SprintsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const create_sprint_dto_1 = require("../dto/create-sprint.dto");
const get_sprints_query_dto_1 = require("../dto/get-sprints-query.dto");
const update_sprint_dto_1 = require("../dto/update-sprint.dto");
const sprints_service_1 = require("../services/sprints.service");
const sprintWriteRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let SprintsController = class SprintsController {
    sprintsService;
    constructor(sprintsService) {
        this.sprintsService = sprintsService;
    }
    createSprint(user, workspaceId, projectId, dto) {
        return this.sprintsService.createSprint(user.id, workspaceId, projectId, dto);
    }
    getSprints(user, workspaceId, projectId, query) {
        return this.sprintsService.getSprints(user.id, workspaceId, projectId, query);
    }
    getSprintDetail(user, workspaceId, projectId, sprintId) {
        return this.sprintsService.getSprintDetail(user.id, workspaceId, projectId, sprintId);
    }
    updateSprint(user, workspaceId, projectId, sprintId, dto) {
        return this.sprintsService.updateSprint(user.id, workspaceId, projectId, sprintId, dto);
    }
    startSprint(user, workspaceId, projectId, sprintId) {
        return this.sprintsService.startSprint(user.id, workspaceId, projectId, sprintId);
    }
    completeSprint(user, workspaceId, projectId, sprintId) {
        return this.sprintsService.completeSprint(user.id, workspaceId, projectId, sprintId);
    }
    cancelSprint(user, workspaceId, projectId, sprintId) {
        return this.sprintsService.cancelSprint(user.id, workspaceId, projectId, sprintId);
    }
};
exports.SprintsController = SprintsController;
__decorate([
    (0, common_1.Post)(),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...sprintWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Create sprint',
        description: 'OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao sprint.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Create sprint successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, create_sprint_dto_1.CreateSprintDto]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "createSprint", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get project sprints',
        description: 'Member ACTIVE nao cung xem duoc sprint trong project.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_sprints_query_dto_1.GetSprintsQueryDto]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "getSprints", null);
__decorate([
    (0, common_1.Get)(':sprintId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get sprint detail',
        description: 'Chi member cua workspace moi xem duoc sprint detail.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'sprintId', example: 'sprint-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('sprintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "getSprintDetail", null);
__decorate([
    (0, common_1.Patch)(':sprintId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...sprintWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Update sprint',
        description: 'Chi update sprint khi status = PLANNED.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'sprintId', example: 'sprint-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('sprintId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, update_sprint_dto_1.UpdateSprintDto]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "updateSprint", null);
__decorate([
    (0, common_1.Patch)(':sprintId/start'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...sprintWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Start sprint',
        description: 'Chi project chua co sprint ACTIVE moi duoc start.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'sprintId', example: 'sprint-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('sprintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "startSprint", null);
__decorate([
    (0, common_1.Patch)(':sprintId/complete'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...sprintWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Complete sprint',
        description: 'Chi sprint ACTIVE moi duoc complete.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'sprintId', example: 'sprint-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('sprintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "completeSprint", null);
__decorate([
    (0, common_1.Patch)(':sprintId/cancel'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...sprintWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel sprint',
        description: 'Chi sprint PLANNED hoac ACTIVE moi duoc cancel.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'sprintId', example: 'sprint-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('sprintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], SprintsController.prototype, "cancelSprint", null);
exports.SprintsController = SprintsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/sprints'),
    (0, swagger_1.ApiTags)('Sprints'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [sprints_service_1.SprintsService])
], SprintsController);
//# sourceMappingURL=sprints.controller.js.map