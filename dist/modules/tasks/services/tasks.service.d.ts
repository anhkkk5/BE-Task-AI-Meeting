import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import { MoveTaskSprintDto } from '../dto/move-task-sprint.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksRepository } from '../repositories/tasks.repository';
import { TaskAccessService } from './task-access.service';
import { TaskCodeService } from './task-code.service';
export declare class TasksService {
    private readonly tasksRepository;
    private readonly taskAccessService;
    private readonly taskCodeService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    constructor(tasksRepository: TasksRepository, taskAccessService: TaskAccessService, taskCodeService: TaskCodeService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService);
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
                status: TaskStatus;
                priority: TaskPriority;
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
    private assertWritableProject;
    private assertBacklogStatusMatchesTaskLocation;
    private toTaskResponse;
}
