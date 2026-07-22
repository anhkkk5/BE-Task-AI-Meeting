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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const assign_task_dto_1 = require("../dto/assign-task.dto");
const create_task_dto_1 = require("../dto/create-task.dto");
const get_tasks_query_dto_1 = require("../dto/get-tasks-query.dto");
const import_tasks_dto_1 = require("../dto/import-tasks.dto");
const move_task_sprint_dto_1 = require("../dto/move-task-sprint.dto");
const update_task_status_dto_1 = require("../dto/update-task-status.dto");
const update_task_dto_1 = require("../dto/update-task.dto");
const tasks_service_1 = require("../services/tasks.service");
const taskWriteRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let TasksController = class TasksController {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    createTask(user, workspaceId, projectId, dto) {
        return this.tasksService.createTask(user.id, workspaceId, projectId, dto);
    }
    getTasks(user, workspaceId, projectId, query) {
        return this.tasksService.getTasks(user.id, workspaceId, projectId, query);
    }
    getBacklogTasks(user, workspaceId, projectId) {
        return this.tasksService.getBacklogTasks(user.id, workspaceId, projectId);
    }
    getSprintTasks(user, workspaceId, projectId, sprintId) {
        return this.tasksService.getSprintTasks(user.id, workspaceId, projectId, sprintId);
    }
    async downloadTaskImportTemplate(user, workspaceId, projectId, response) {
        const buffer = await this.tasksService.createTaskImportTemplate(user.id, workspaceId, projectId);
        response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.setHeader('Content-Disposition', 'attachment; filename="backlog-import-template.xlsx"');
        return response.send(buffer);
    }
    previewTaskImport(user, workspaceId, projectId, file) {
        return this.tasksService.previewTaskImport(user.id, workspaceId, projectId, file);
    }
    commitTaskImport(user, workspaceId, projectId, dto) {
        return this.tasksService.commitTaskImport(user.id, workspaceId, projectId, dto);
    }
    getTaskDetail(user, workspaceId, projectId, taskId) {
        return this.tasksService.getTaskDetail(user.id, workspaceId, projectId, taskId);
    }
    updateTask(user, workspaceId, projectId, taskId, dto) {
        return this.tasksService.updateTask(user.id, workspaceId, projectId, taskId, dto);
    }
    updateTaskStatus(user, workspaceId, projectId, taskId, dto) {
        return this.tasksService.updateTaskStatus(user.id, workspaceId, projectId, taskId, dto);
    }
    assignTask(user, workspaceId, projectId, taskId, dto) {
        return this.tasksService.assignTask(user.id, workspaceId, projectId, taskId, dto);
    }
    moveTaskToSprint(user, workspaceId, projectId, taskId, dto) {
        return this.tasksService.moveTaskToSprint(user.id, workspaceId, projectId, taskId, dto);
    }
    cancelTask(user, workspaceId, projectId, taskId) {
        return this.tasksService.cancelTask(user.id, workspaceId, projectId, taskId);
    }
    deleteTask(user, workspaceId, projectId, taskId) {
        return this.tasksService.deleteTask(user.id, workspaceId, projectId, taskId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)('tasks'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...taskWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Create task',
        description: 'OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao task trong project.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Create task successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)('tasks'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get project tasks',
        description: 'Tat ca member ACTIVE trong workspace deu xem duoc task cua project.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_tasks_query_dto_1.GetTasksQueryDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Get)('tasks/backlog'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get backlog tasks' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "getBacklogTasks", null);
__decorate([
    (0, common_1.Get)('sprints/:sprintId/tasks'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get sprint tasks' }),
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
], TasksController.prototype, "getSprintTasks", null);
__decorate([
    (0, common_1.Get)('tasks/import/template'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...taskWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Download Excel backlog import template',
        description: 'Tai file Excel mau co sheet Backlog import, Sprints, Members de nhap task nhanh giong Jira.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "downloadTaskImportTemplate", null);
__decorate([
    (0, common_1.Post)('tasks/import/preview'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...taskWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 2 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Preview Excel backlog import',
        description: 'Upload file Excel de kiem tra title, sprint, assignee va status truoc khi tao task.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "previewTaskImport", null);
__decorate([
    (0, common_1.Post)('tasks/import/commit'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...taskWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Commit Excel backlog import',
        description: 'Tao task tu cac dong da preview hop le. Task co sprint se vao sprint, task khong co sprint se nam o Backlog.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, import_tasks_dto_1.CommitTaskImportDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "commitTaskImport", null);
__decorate([
    (0, common_1.Get)('tasks/:taskId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get task detail' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', example: 'task-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "getTaskDetail", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...taskWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Update task',
        description: 'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc cap nhat thong tin task.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', example: 'task-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId/status'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Update task status',
        description: 'Manager role duoc doi status moi task. MEMBER chi doi task duoc gan cho minh.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', example: 'task-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, update_task_status_dto_1.UpdateTaskStatusDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "updateTaskStatus", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId/assign'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...taskWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Assign task' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', example: 'task-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, assign_task_dto_1.AssignTaskDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "assignTask", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId/sprint'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...taskWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Move task to sprint or backlog' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', example: 'task-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, move_task_sprint_dto_1.MoveTaskSprintDto]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "moveTaskToSprint", null);
__decorate([
    (0, common_1.Patch)('tasks/:taskId/cancel'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...taskWriteRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel task' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', example: 'task-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "cancelTask", null);
__decorate([
    (0, common_1.Delete)('tasks/:taskId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete task',
        description: 'Nguoi tao task hoac OWNER, SCRUM_MASTER, PROJECT_MANAGER duoc xoa task.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'taskId', example: 'task-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], TasksController.prototype, "deleteTask", null);
exports.TasksController = TasksController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId'),
    (0, swagger_1.ApiTags)('Tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map