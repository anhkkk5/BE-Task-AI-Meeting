import ExcelJS from 'exceljs';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { SprintsRepository } from '../../sprints/repositories/sprints.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import { CommitTaskImportDto, TaskImportItemDto } from '../dto/import-tasks.dto';
import { MoveTaskSprintDto } from '../dto/move-task-sprint.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from '../dto/task-comment.dto';
import { TaskActivityAction } from '../entities/task-activity-log.entity';
import { TaskActivityLogsRepository } from '../repositories/task-activity-logs.repository';
import { TaskCommentsRepository } from '../repositories/task-comments.repository';
import { TasksRepository } from '../repositories/tasks.repository';
import { TaskDependenciesRepository } from '../repositories/task-dependencies.repository';
import { TaskAccessService } from './task-access.service';
import { TaskCodeService } from './task-code.service';
type UploadedExcelFile = {
    buffer: Buffer;
    originalname?: string;
    mimetype?: string;
    size?: number;
};
type ImportField = 'title' | 'description' | 'sprintId' | 'sprintName' | 'status' | 'assigneeId' | 'assigneeEmail' | 'dueDate' | 'estimatedHours' | 'storyPoints';
type ImportRawRow = Record<ImportField, string>;
type ImportPreviewRow = {
    rowNumber: number;
    valid: boolean;
    errors: string[];
    data: TaskImportItemDto;
    raw: ImportRawRow;
};
export declare class TasksService {
    private readonly tasksRepository;
    private readonly taskAccessService;
    private readonly taskCodeService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    private readonly workspaceMembersRepository;
    private readonly sprintsRepository;
    private readonly taskActivityLogsRepository?;
    private readonly taskCommentsRepository?;
    private readonly notificationsService?;
    private readonly taskDependenciesRepository?;
    constructor(tasksRepository: TasksRepository, taskAccessService: TaskAccessService, taskCodeService: TaskCodeService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService, workspaceMembersRepository: WorkspaceMembersRepository, sprintsRepository: SprintsRepository, taskActivityLogsRepository?: TaskActivityLogsRepository | undefined, taskCommentsRepository?: TaskCommentsRepository | undefined, notificationsService?: NotificationsService | undefined, taskDependenciesRepository?: TaskDependenciesRepository | undefined);
    createTask(currentUserId: string, workspaceId: string, projectId: string, dto: CreateTaskDto): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    createTaskImportTemplate(currentUserId: string, workspaceId: string, projectId: string): Promise<Buffer<ExcelJS.Buffer>>;
    previewTaskImport(currentUserId: string, workspaceId: string, projectId: string, file: UploadedExcelFile | undefined): Promise<{
        success: boolean;
        message: string;
        data: {
            items: ImportPreviewRow[];
            summary: {
                totalRows: number;
                validRows: number;
                invalidRows: number;
            };
        };
    }>;
    commitTaskImport(currentUserId: string, workspaceId: string, projectId: string, dto: CommitTaskImportDto): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
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
    getTasks(currentUserId: string, workspaceId: string, projectId: string, query: GetTasksQueryDto): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
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
    getBacklogTasks(currentUserId: string, workspaceId: string, projectId: string): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            }[];
        };
    }>;
    getSprintTasks(currentUserId: string, workspaceId: string, projectId: string, sprintId: string): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            }[];
        };
    }>;
    getTaskDetail(currentUserId: string, workspaceId: string, projectId: string, taskId: string): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    getTaskActivities(currentUserId: string, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                action: TaskActivityAction;
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
    getTaskComments(currentUserId: string, workspaceId: string, projectId: string, taskId: string): Promise<{
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
    createTaskComment(currentUserId: string, workspaceId: string, projectId: string, taskId: string, dto: CreateTaskCommentDto): Promise<{
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
    updateTaskComment(currentUserId: string, workspaceId: string, projectId: string, taskId: string, commentId: string, dto: UpdateTaskCommentDto): Promise<{
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
    deleteTaskComment(currentUserId: string, workspaceId: string, projectId: string, taskId: string, commentId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    updateTask(currentUserId: string, workspaceId: string, projectId: string, taskId: string, dto: UpdateTaskDto): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    updateTaskStatus(currentUserId: string, workspaceId: string, projectId: string, taskId: string, dto: UpdateTaskStatusDto): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    assignTask(currentUserId: string, workspaceId: string, projectId: string, taskId: string, dto: AssignTaskDto): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    moveTaskToSprint(currentUserId: string, workspaceId: string, projectId: string, taskId: string, dto: MoveTaskSprintDto): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    cancelTask(currentUserId: string, workspaceId: string, projectId: string, taskId: string): Promise<{
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
                status: TaskStatus;
                workflowStatusId: string | null;
                taskType: TaskType;
                priority: TaskPriority;
                parentId: string | null;
                parent: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                } | null;
                children: {
                    id: string;
                    taskCode: string;
                    title: string;
                    taskType: TaskType;
                    status: TaskStatus;
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
                    status: SprintStatus;
                } | null;
                dueDate: string | null;
                estimatedHours: number | null;
                storyPoints: number | null;
                completedAt: Date | null;
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    deleteTask(currentUserId: string, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    private buildImportContext;
    private getImportHeaderMap;
    private readImportRawRow;
    private importItemToRawRow;
    private validateImportRawRow;
    private resolveImportSprintId;
    private assertImportSprintCanReceiveTask;
    private resolveImportAssigneeId;
    private resolveImportStatus;
    private resolveImportDate;
    private normalizeDateParts;
    private resolveImportNumber;
    private resolveImportInteger;
    private isEmptyImportRawRow;
    private cellToText;
    private formatDateOnly;
    private notifyNewlyUnblockedTasks;
    private assertWritableProject;
    private assertTaskReadable;
    private requireOwnComment;
    private resolveMentionedUserIds;
    private toCommentResponse;
    private recordActivity;
    private pickTaskFields;
    private buildChanges;
    private compactChanges;
    private assertBacklogStatusMatchesTaskLocation;
    private assertValidParent;
    private normalizeLabels;
    private toTaskResponse;
}
export {};
