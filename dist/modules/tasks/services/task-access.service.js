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
exports.TaskAccessService = void 0;
const common_1 = require("@nestjs/common");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const tasks_repository_1 = require("../repositories/tasks.repository");
const taskManagerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let TaskAccessService = class TaskAccessService {
    tasksRepository;
    sprintAccessService;
    workspaceAccessService;
    constructor(tasksRepository, sprintAccessService, workspaceAccessService) {
        this.tasksRepository = tasksRepository;
        this.sprintAccessService = sprintAccessService;
        this.workspaceAccessService = workspaceAccessService;
    }
    getTaskInProject(taskId, projectId) {
        return this.tasksRepository.findByIdAndProject(taskId, projectId);
    }
    async assertTaskInProject(taskId, projectId) {
        const task = await this.getTaskInProject(taskId, projectId);
        if (!task) {
            throw new common_1.NotFoundException('Task not found in this project');
        }
        return task;
    }
    assertTaskEditable(task) {
        if (task.status === task_status_enum_1.TaskStatus.Cancelled) {
            throw new common_1.BadRequestException('Cancelled task can not be updated');
        }
    }
    async assertAssignableUser(userId, workspaceId) {
        try {
            return await this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
        }
        catch {
            throw new common_1.BadRequestException('Assignee is not an active member of this workspace');
        }
    }
    async assertSprintCanReceiveTask(sprintId, projectId) {
        const sprint = await this.assertSprintInProject(sprintId, projectId);
        if ([sprint_status_enum_1.SprintStatus.Completed, sprint_status_enum_1.SprintStatus.Cancelled].includes(sprint.status)) {
            throw new common_1.BadRequestException('Can not add task to completed or cancelled sprint');
        }
        return sprint;
    }
    assertSprintInProject(sprintId, projectId) {
        return this.sprintAccessService.assertSprintInProject(sprintId, projectId);
    }
    async assertUserCanUpdateTaskStatus(userId, workspaceId, task, nextStatus) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(userId, workspaceId);
        if (!role) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        if (taskManagerRoles.includes(role)) {
            return role;
        }
        if (role === workspace_role_enum_1.WorkspaceRole.Member &&
            task.assigneeId === userId &&
            nextStatus !== task_status_enum_1.TaskStatus.Cancelled) {
            return role;
        }
        throw new common_1.ForbiddenException('You can not update this task status');
    }
    async assertUserCanDeleteTask(userId, workspaceId, task) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(userId, workspaceId);
        if (!role) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        if (taskManagerRoles.includes(role) || task.createdBy === userId) {
            return role;
        }
        throw new common_1.ForbiddenException('You cannot delete this task');
    }
};
exports.TaskAccessService = TaskAccessService;
exports.TaskAccessService = TaskAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tasks_repository_1.TasksRepository,
        sprint_access_service_1.SprintAccessService,
        workspace_access_service_1.WorkspaceAccessService])
], TaskAccessService);
//# sourceMappingURL=task-access.service.js.map