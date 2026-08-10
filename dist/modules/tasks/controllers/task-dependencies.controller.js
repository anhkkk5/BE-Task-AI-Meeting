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
exports.TaskDependenciesController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const create_task_dependency_dto_1 = require("../dto/create-task-dependency.dto");
const task_dependencies_service_1 = require("../services/task-dependencies.service");
const managerRoles = [workspace_role_enum_1.WorkspaceRole.Owner, workspace_role_enum_1.WorkspaceRole.ScrumMaster, workspace_role_enum_1.WorkspaceRole.ProjectManager];
let TaskDependenciesController = class TaskDependenciesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(user, workspaceId, projectId, taskId) {
        return this.service.list(user.id, workspaceId, projectId, taskId);
    }
    create(user, workspaceId, projectId, taskId, dto) {
        return this.service.create(user.id, workspaceId, projectId, taskId, dto);
    }
    remove(user, workspaceId, projectId, taskId, dependencyId) {
        return this.service.remove(user.id, workspaceId, projectId, taskId, dependencyId);
    }
};
exports.TaskDependenciesController = TaskDependenciesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], TaskDependenciesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, create_task_dependency_dto_1.CreateTaskDependencyDto]),
    __metadata("design:returntype", void 0)
], TaskDependenciesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':dependencyId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __param(4, (0, common_1.Param)('dependencyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TaskDependenciesController.prototype, "remove", null);
exports.TaskDependenciesController = TaskDependenciesController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/tasks/:taskId/dependencies'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [task_dependencies_service_1.TaskDependenciesService])
], TaskDependenciesController);
//# sourceMappingURL=task-dependencies.controller.js.map