import type { Request } from 'express';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateHandoverDto } from '../dto/create-handover.dto';
import { GetHandoversQueryDto } from '../dto/get-handovers-query.dto';
import { RejectHandoverDto } from '../dto/reject-handover.dto';
import { RequestHandoverChangesDto } from '../dto/request-handover-changes.dto';
import { UpdateHandoverDto } from '../dto/update-handover.dto';
import { ShiftHandoversService } from '../services/shift-handovers.service';
export declare class ShiftHandoversController {
    private readonly service;
    constructor(service: ShiftHandoversService);
    uploadAttachments(request: Request, files: Express.Multer.File[]): {
        success: boolean;
        message: string;
        data: {
            files: {
                name: string;
                size: number;
                mimeType: string;
                url: string;
            }[];
        };
    };
    createHandover(user: AuthUser, workspaceId: string, projectId: string, dto: CreateHandoverDto): Promise<{
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
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
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
                status: import("../../../common/enums/handover-status.enum").HandoverStatus;
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
    getHandovers(user: AuthUser, workspaceId: string, projectId: string, query: GetHandoversQueryDto): Promise<{
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
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
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
                status: import("../../../common/enums/handover-status.enum").HandoverStatus;
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
    getHandover(user: AuthUser, workspaceId: string, projectId: string, handoverId: string): Promise<{
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
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
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
                status: import("../../../common/enums/handover-status.enum").HandoverStatus;
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
    updateHandover(user: AuthUser, workspaceId: string, projectId: string, handoverId: string, dto: UpdateHandoverDto): Promise<{
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
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
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
                status: import("../../../common/enums/handover-status.enum").HandoverStatus;
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
    submit(user: AuthUser, workspaceId: string, projectId: string, handoverId: string): Promise<{
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
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
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
                status: import("../../../common/enums/handover-status.enum").HandoverStatus;
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
    requestChanges(user: AuthUser, workspaceId: string, projectId: string, handoverId: string, dto: RequestHandoverChangesDto): Promise<{
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
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
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
                status: import("../../../common/enums/handover-status.enum").HandoverStatus;
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
    reject(user: AuthUser, workspaceId: string, projectId: string, handoverId: string, dto: RejectHandoverDto): Promise<{
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
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
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
                status: import("../../../common/enums/handover-status.enum").HandoverStatus;
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
    accept(user: AuthUser, workspaceId: string, projectId: string, handoverId: string): Promise<{
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
                    status: import("../../../common/enums/task-status.enum").TaskStatus;
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
                status: import("../../../common/enums/handover-status.enum").HandoverStatus;
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
    deleteHandover(user: AuthUser, workspaceId: string, projectId: string, handoverId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
