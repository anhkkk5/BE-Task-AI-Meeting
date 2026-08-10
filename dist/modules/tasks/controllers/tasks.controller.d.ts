import type { Response } from 'express';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import { CommitTaskImportDto } from '../dto/import-tasks.dto';
import { MoveTaskSprintDto } from '../dto/move-task-sprint.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksService } from '../services/tasks.service';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from '../dto/task-comment.dto';
type UploadedExcelFile = {
    buffer: Buffer;
    originalname?: string;
    mimetype?: string;
    size?: number;
};
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            }[];
        };
    }>;
    downloadTaskImportTemplate(user: AuthUser, workspaceId: string, projectId: string, response: Response): Promise<Response<any, Record<string, any>>>;
    previewTaskImport(user: AuthUser, workspaceId: string, projectId: string, file: UploadedExcelFile | undefined): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                rowNumber: number;
                valid: boolean;
                errors: string[];
                data: import("../dto/import-tasks.dto").TaskImportItemDto;
                raw: {
                    status: string;
                    description: string;
                    title: string;
                    sprintId: string;
                    assigneeId: string;
                    dueDate: string;
                    estimatedHours: string;
                    storyPoints: string;
                    sprintName: string;
                    assigneeEmail: string;
                };
            }[];
            summary: {
                totalRows: number;
                validRows: number;
                invalidRows: number;
            };
        };
    }>;
    commitTaskImport(user: AuthUser, workspaceId: string, projectId: string, dto: CommitTaskImportDto): Promise<{
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            }[];
            summary: {
                created: number;
            };
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    getTaskActivities(user: AuthUser, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                action: import("../entities/task-activity-log.entity").TaskActivityAction;
                changes: Record<string, {
                    from: unknown;
                    to: unknown;
                }> | null;
                actor: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                };
                createdAt: Date;
            }[];
        };
    }>;
    getTaskComments(user: AuthUser, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                taskId: string;
                content: string;
                mentionedUserIds: string[];
                author: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                };
                createdAt: Date;
                updatedAt: Date;
            }[];
        };
    }>;
    createTaskComment(user: AuthUser, workspaceId: string, projectId: string, taskId: string, dto: CreateTaskCommentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            comment: {
                id: string;
                taskId: string;
                content: string;
                mentionedUserIds: string[];
                author: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                };
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateTaskComment(user: AuthUser, workspaceId: string, projectId: string, taskId: string, commentId: string, dto: UpdateTaskCommentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            comment: {
                id: string;
                taskId: string;
                content: string;
                mentionedUserIds: string[];
                author: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                };
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    deleteTaskComment(user: AuthUser, workspaceId: string, projectId: string, taskId: string, commentId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
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
                labels: string[];
                acceptanceCriteria: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                taskType: import("../../../common/enums/task-type.enum").TaskType;
                priority: import("../../../common/enums/task-priority.enum").TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: import("../../../common/enums/task-type.enum").TaskType;
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
                }[];
                childProgress: {
                    total: number;
                    done: number;
                    percent: number;
                } | null;
                assigneeId: string | null;
                assignee: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                reporterId: string | null;
                reporter: {
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
                completedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    deleteTask(user: AuthUser, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
export {};
