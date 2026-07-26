import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateHandoverDto } from '../dto/create-handover.dto';
import { GetHandoversQueryDto } from '../dto/get-handovers-query.dto';
import { UpdateHandoverDto } from '../dto/update-handover.dto';
import { ShiftHandoversRepository } from '../repositories/shift-handovers.repository';
import { HandoverEventsService } from './handover-events.service';
export declare class ShiftHandoversService {
    private readonly repository;
    private readonly workspaceAccess;
    private readonly projectAccess;
    private readonly workspaceMembers;
    private readonly tasksRepository;
    private readonly handoverEvents;
    constructor(repository: ShiftHandoversRepository, workspaceAccess: WorkspaceAccessService, projectAccess: ProjectAccessService, workspaceMembers: WorkspaceMembersRepository, tasksRepository: TasksRepository, handoverEvents: HandoverEventsService);
    createHandover(userId: string, workspaceId: string, projectId: string, dto: CreateHandoverDto): Promise<{
        success: boolean;
        message: string;
        data: {
            handover: {
                id: string;
                workspaceId: string;
                projectId: string;
                taskId: string | null;
                task: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: TaskStatus;
                    assigneeId: string | null;
                    assignee: {
                        id: string;
                        fullName: string;
                        email: string;
                        avatarUrl: string | null;
                    } | null;
                } | null;
                senderId: string;
                receiverId: string;
                sender: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                receiver: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                title: string;
                completedWork: string | null;
                remainingWork: string | null;
                blockers: string | null;
                nextSteps: string | null;
                referenceLinks: string | null;
                dueAt: Date | null;
                status: HandoverStatus;
                changeRequest: string | null;
                rejectionReason: string | null;
                submittedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getHandovers(userId: string, workspaceId: string, projectId: string, query: GetHandoversQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                workspaceId: string;
                projectId: string;
                taskId: string | null;
                task: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: TaskStatus;
                    assigneeId: string | null;
                    assignee: {
                        id: string;
                        fullName: string;
                        email: string;
                        avatarUrl: string | null;
                    } | null;
                } | null;
                senderId: string;
                receiverId: string;
                sender: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                receiver: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                title: string;
                completedWork: string | null;
                remainingWork: string | null;
                blockers: string | null;
                nextSteps: string | null;
                referenceLinks: string | null;
                dueAt: Date | null;
                status: HandoverStatus;
                changeRequest: string | null;
                rejectionReason: string | null;
                submittedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
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
    getHandover(userId: string, workspaceId: string, projectId: string, handoverId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            handover: {
                id: string;
                workspaceId: string;
                projectId: string;
                taskId: string | null;
                task: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: TaskStatus;
                    assigneeId: string | null;
                    assignee: {
                        id: string;
                        fullName: string;
                        email: string;
                        avatarUrl: string | null;
                    } | null;
                } | null;
                senderId: string;
                receiverId: string;
                sender: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                receiver: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                title: string;
                completedWork: string | null;
                remainingWork: string | null;
                blockers: string | null;
                nextSteps: string | null;
                referenceLinks: string | null;
                dueAt: Date | null;
                status: HandoverStatus;
                changeRequest: string | null;
                rejectionReason: string | null;
                submittedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateHandover(userId: string, workspaceId: string, projectId: string, handoverId: string, dto: UpdateHandoverDto): Promise<{
        success: boolean;
        message: string;
        data: {
            handover: {
                id: string;
                workspaceId: string;
                projectId: string;
                taskId: string | null;
                task: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: TaskStatus;
                    assigneeId: string | null;
                    assignee: {
                        id: string;
                        fullName: string;
                        email: string;
                        avatarUrl: string | null;
                    } | null;
                } | null;
                senderId: string;
                receiverId: string;
                sender: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                receiver: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                title: string;
                completedWork: string | null;
                remainingWork: string | null;
                blockers: string | null;
                nextSteps: string | null;
                referenceLinks: string | null;
                dueAt: Date | null;
                status: HandoverStatus;
                changeRequest: string | null;
                rejectionReason: string | null;
                submittedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    submitHandover(userId: string, workspaceId: string, projectId: string, handoverId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            handover: {
                id: string;
                workspaceId: string;
                projectId: string;
                taskId: string | null;
                task: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: TaskStatus;
                    assigneeId: string | null;
                    assignee: {
                        id: string;
                        fullName: string;
                        email: string;
                        avatarUrl: string | null;
                    } | null;
                } | null;
                senderId: string;
                receiverId: string;
                sender: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                receiver: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                title: string;
                completedWork: string | null;
                remainingWork: string | null;
                blockers: string | null;
                nextSteps: string | null;
                referenceLinks: string | null;
                dueAt: Date | null;
                status: HandoverStatus;
                changeRequest: string | null;
                rejectionReason: string | null;
                submittedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    requestChanges(userId: string, workspaceId: string, projectId: string, handoverId: string, reason: string): Promise<{
        success: boolean;
        message: string;
        data: {
            handover: {
                id: string;
                workspaceId: string;
                projectId: string;
                taskId: string | null;
                task: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: TaskStatus;
                    assigneeId: string | null;
                    assignee: {
                        id: string;
                        fullName: string;
                        email: string;
                        avatarUrl: string | null;
                    } | null;
                } | null;
                senderId: string;
                receiverId: string;
                sender: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                receiver: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                title: string;
                completedWork: string | null;
                remainingWork: string | null;
                blockers: string | null;
                nextSteps: string | null;
                referenceLinks: string | null;
                dueAt: Date | null;
                status: HandoverStatus;
                changeRequest: string | null;
                rejectionReason: string | null;
                submittedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    reject(userId: string, workspaceId: string, projectId: string, handoverId: string, reason: string): Promise<{
        success: boolean;
        message: string;
        data: {
            handover: {
                id: string;
                workspaceId: string;
                projectId: string;
                taskId: string | null;
                task: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: TaskStatus;
                    assigneeId: string | null;
                    assignee: {
                        id: string;
                        fullName: string;
                        email: string;
                        avatarUrl: string | null;
                    } | null;
                } | null;
                senderId: string;
                receiverId: string;
                sender: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                receiver: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                title: string;
                completedWork: string | null;
                remainingWork: string | null;
                blockers: string | null;
                nextSteps: string | null;
                referenceLinks: string | null;
                dueAt: Date | null;
                status: HandoverStatus;
                changeRequest: string | null;
                rejectionReason: string | null;
                submittedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    accept(userId: string, workspaceId: string, projectId: string, handoverId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            handover: {
                id: string;
                workspaceId: string;
                projectId: string;
                taskId: string | null;
                task: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: TaskStatus;
                    assigneeId: string | null;
                    assignee: {
                        id: string;
                        fullName: string;
                        email: string;
                        avatarUrl: string | null;
                    } | null;
                } | null;
                senderId: string;
                receiverId: string;
                sender: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                receiver: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                title: string;
                completedWork: string | null;
                remainingWork: string | null;
                blockers: string | null;
                nextSteps: string | null;
                referenceLinks: string | null;
                dueAt: Date | null;
                status: HandoverStatus;
                changeRequest: string | null;
                rejectionReason: string | null;
                submittedAt: Date | null;
                acceptedAt: Date | null;
                rejectedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    deleteHandover(userId: string, workspaceId: string, projectId: string, handoverId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    private assertContext;
    private assertActiveMember;
    private assertCreatorOrManager;
    private assertTaskCanBeHandedOver;
    private getTask;
    private getHandoverEntity;
    private assertSenderCanEdit;
    private assertReceiverPending;
    private optionalText;
    private mapUser;
    private mapHandover;
    private response;
}
