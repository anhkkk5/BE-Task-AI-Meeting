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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const task_priority_enum_1 = require("../../../common/enums/task-priority.enum");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const project_access_service_1 = require("../../projects/services/project-access.service");
const tasks_repository_1 = require("../repositories/tasks.repository");
const task_access_service_1 = require("./task-access.service");
const task_code_service_1 = require("./task-code.service");
let TasksService = class TasksService {
    tasksRepository;
    taskAccessService;
    taskCodeService;
    workspaceAccessService;
    projectAccessService;
    constructor(tasksRepository, taskAccessService, taskCodeService, workspaceAccessService, projectAccessService) {
        this.tasksRepository = tasksRepository;
        this.taskAccessService = taskAccessService;
        this.taskCodeService = taskCodeService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
    }
    async createTask(currentUserId, workspaceId, projectId, dto) {
        const project = await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        if (dto.sprintId) {
            await this.taskAccessService.assertSprintCanReceiveTask(dto.sprintId, projectId);
        }
        if (dto.assigneeId) {
            await this.taskAccessService.assertAssignableUser(dto.assigneeId, workspaceId);
        }
        const taskCode = await this.taskCodeService.generateTaskCode(project);
        const task = await this.tasksRepository.create({
            projectId,
            sprintId: dto.sprintId ?? null,
            taskCode,
            title: dto.title.trim(),
            description: dto.description?.trim() || null,
            status: dto.sprintId ? task_status_enum_1.TaskStatus.Todo : task_status_enum_1.TaskStatus.Backlog,
            priority: dto.priority ?? task_priority_enum_1.TaskPriority.Medium,
            assigneeId: dto.assigneeId ?? null,
            createdBy: currentUserId,
            dueDate: dto.dueDate ?? null,
            estimatedHours: dto.estimatedHours ?? null,
            storyPoints: dto.storyPoints ?? null,
        });
        return {
            success: true,
            message: 'Create task successfully',
            data: {
                task: this.toTaskResponse(task),
            },
        };
    }
    async getTasks(currentUserId, workspaceId, projectId, query) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        if (query.sprintId) {
            await this.taskAccessService.assertSprintInProject(query.sprintId, projectId);
        }
        const result = await this.tasksRepository.findByProject(projectId, query);
        return {
            success: true,
            message: 'Get tasks successfully',
            data: {
                items: result.items.map((task) => this.toTaskResponse(task)),
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                },
            },
        };
    }
    async getBacklogTasks(currentUserId, workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const items = await this.tasksRepository.findBacklogByProject(projectId);
        return {
            success: true,
            message: 'Get backlog tasks successfully',
            data: {
                items: items.map((task) => this.toTaskResponse(task)),
            },
        };
    }
    async getSprintTasks(currentUserId, workspaceId, projectId, sprintId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.taskAccessService.assertSprintInProject(sprintId, projectId);
        const items = await this.tasksRepository.findBySprint(projectId, sprintId);
        return {
            success: true,
            message: 'Get sprint tasks successfully',
            data: {
                items: items.map((task) => this.toTaskResponse(task)),
            },
        };
    }
    async getTaskDetail(currentUserId, workspaceId, projectId, taskId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        return {
            success: true,
            message: 'Get task detail successfully',
            data: {
                task: this.toTaskResponse(task),
            },
        };
    }
    async updateTask(currentUserId, workspaceId, projectId, taskId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        const updatedTask = await this.tasksRepository.update(task, {
            title: dto.title?.trim() ?? task.title,
            description: dto.description === undefined
                ? task.description
                : dto.description.trim() || null,
            priority: dto.priority ?? task.priority,
            dueDate: dto.dueDate ?? task.dueDate,
            estimatedHours: dto.estimatedHours ?? task.estimatedHours,
            storyPoints: dto.storyPoints ?? task.storyPoints,
        });
        return {
            success: true,
            message: 'Update task successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async updateTaskStatus(currentUserId, workspaceId, projectId, taskId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        await this.taskAccessService.assertUserCanUpdateTaskStatus(currentUserId, workspaceId, task, dto.status);
        this.assertBacklogStatusMatchesTaskLocation(task, dto.status);
        const updatedTask = await this.tasksRepository.update(task, {
            status: dto.status,
        });
        return {
            success: true,
            message: 'Update task status successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async assignTask(currentUserId, workspaceId, projectId, taskId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        if (dto.assigneeId) {
            await this.taskAccessService.assertAssignableUser(dto.assigneeId, workspaceId);
        }
        const updatedTask = await this.tasksRepository.update(task, {
            assigneeId: dto.assigneeId,
        });
        return {
            success: true,
            message: 'Assign task successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async moveTaskToSprint(currentUserId, workspaceId, projectId, taskId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        if (dto.sprintId) {
            await this.taskAccessService.assertSprintCanReceiveTask(dto.sprintId, projectId);
        }
        const updatedTask = await this.tasksRepository.update(task, {
            sprintId: dto.sprintId,
            status: dto.sprintId
                ? task.status === task_status_enum_1.TaskStatus.Backlog
                    ? task_status_enum_1.TaskStatus.Todo
                    : task.status
                : task_status_enum_1.TaskStatus.Backlog,
        });
        return {
            success: true,
            message: 'Move task sprint successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async cancelTask(currentUserId, workspaceId, projectId, taskId) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        const updatedTask = await this.tasksRepository.update(task, {
            status: task_status_enum_1.TaskStatus.Cancelled,
        });
        return {
            success: true,
            message: 'Cancel task successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async assertWritableProject(workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        return this.projectAccessService.assertProjectActive(projectId, workspaceId);
    }
    assertBacklogStatusMatchesTaskLocation(task, nextStatus) {
        if (nextStatus === task_status_enum_1.TaskStatus.Backlog && task.sprintId) {
            throw new common_1.BadRequestException('Move task to backlog before setting BACKLOG status');
        }
    }
    toTaskResponse(task) {
        return {
            id: task.id,
            projectId: task.projectId,
            sprintId: task.sprintId,
            taskCode: task.taskCode,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId,
            assignee: task.assignee
                ? {
                    id: task.assignee.id,
                    fullName: task.assignee.fullName,
                    email: task.assignee.email,
                    avatarUrl: task.assignee.avatarUrl,
                }
                : null,
            createdBy: task.createdBy,
            creator: task.creator
                ? {
                    id: task.creator.id,
                    fullName: task.creator.fullName,
                    email: task.creator.email,
                }
                : null,
            sprint: task.sprint
                ? {
                    id: task.sprint.id,
                    name: task.sprint.name,
                    status: task.sprint.status,
                }
                : null,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            storyPoints: task.storyPoints,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tasks_repository_1.TasksRepository,
        task_access_service_1.TaskAccessService,
        task_code_service_1.TaskCodeService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map