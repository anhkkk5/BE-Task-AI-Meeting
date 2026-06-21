import type { AuthUser } from '../../auth/types/auth-user.type';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import { MoveTaskSprintDto } from '../dto/move-task-sprint.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksService } from '../services/tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    createTask(user: AuthUser, workspaceId: string, projectId: string, dto: CreateTaskDto): Promise<{
        success: boolean;
        message: string;
        data: {
            task: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getTasks(user: AuthUser, workspaceId: string, projectId: string, query: GetTasksQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
    getBacklogTasks(user: AuthUser, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        };
    }>;
    getSprintTasks(user: AuthUser, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        };
    }>;
    getTaskDetail(user: AuthUser, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            task: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateTask(user: AuthUser, workspaceId: string, projectId: string, taskId: string, dto: UpdateTaskDto): Promise<{
        success: boolean;
        message: string;
        data: {
            task: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateTaskStatus(user: AuthUser, workspaceId: string, projectId: string, taskId: string, dto: UpdateTaskStatusDto): Promise<{
        success: boolean;
        message: string;
        data: {
            task: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    assignTask(user: AuthUser, workspaceId: string, projectId: string, taskId: string, dto: AssignTaskDto): Promise<{
        success: boolean;
        message: string;
        data: {
            task: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    moveTaskToSprint(user: AuthUser, workspaceId: string, projectId: string, taskId: string, dto: MoveTaskSprintDto): Promise<{
        success: boolean;
        message: string;
        data: {
            task: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    cancelTask(user: AuthUser, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            task: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
}
