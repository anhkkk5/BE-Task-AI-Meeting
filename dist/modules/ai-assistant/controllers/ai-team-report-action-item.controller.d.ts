import { TeamReportActionItemSource } from '../../../common/enums/team-report-action-item-status.enum';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateTeamReportTaskDto } from '../dto/create-team-report-task.dto';
import { DismissTeamReportActionItemDto } from '../dto/dismiss-team-report-action-item.dto';
import { RequestTeamReportHandoverDto } from '../dto/request-team-report-handover.dto';
import { AiTeamReportActionItemService } from '../services/ai-team-report-action-item.service';
export declare class AiTeamReportActionItemController {
    private readonly service;
    constructor(service: AiTeamReportActionItemService);
    getActionItems(user: AuthUser, workspaceId: string, projectId: string, reportId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                itemIndex: number;
                source: TeamReportActionItemSource;
                text: string;
                status: import("../../../common/enums/team-report-action-item-status.enum").TeamReportActionItemStatus;
                createdTaskId: string | null;
                targetTaskId: string | null;
                suggestedReceiverId: string | null;
                handoverId: string | null;
                note: string | null;
                handledAt: Date | null;
            }[];
            canHandle: boolean;
        };
    }>;
    createTask(user: AuthUser, workspaceId: string, projectId: string, reportId: string, dto: CreateTeamReportTaskDto): Promise<{
        success: boolean;
        message: string;
        data: {
            item: {
                itemIndex: number;
                source: TeamReportActionItemSource;
                text: string;
                status: import("../../../common/enums/team-report-action-item-status.enum").TeamReportActionItemStatus;
                createdTaskId: string | null;
                targetTaskId: string | null;
                suggestedReceiverId: string | null;
                handoverId: string | null;
                note: string | null;
                handledAt: Date | null;
            };
            task: {
                id: string;
                projectId: string;
                sprintId: string | null;
                taskCode: string;
                title: string;
                description: string | null;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
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
    requestHandover(user: AuthUser, workspaceId: string, projectId: string, reportId: string, dto: RequestTeamReportHandoverDto): Promise<{
        success: boolean;
        message: string;
        data: {
            item: {
                itemIndex: number;
                source: TeamReportActionItemSource;
                text: string;
                status: import("../../../common/enums/team-report-action-item-status.enum").TeamReportActionItemStatus;
                createdTaskId: string | null;
                targetTaskId: string | null;
                suggestedReceiverId: string | null;
                handoverId: string | null;
                note: string | null;
                handledAt: Date | null;
            };
        };
    }>;
    dismiss(user: AuthUser, workspaceId: string, projectId: string, reportId: string, source: TeamReportActionItemSource, itemIndex: number, dto: DismissTeamReportActionItemDto): Promise<{
        success: boolean;
        message: string;
        data: {
            item: {
                itemIndex: number;
                source: TeamReportActionItemSource;
                text: string;
                status: import("../../../common/enums/team-report-action-item-status.enum").TeamReportActionItemStatus;
                createdTaskId: string | null;
                targetTaskId: string | null;
                suggestedReceiverId: string | null;
                handoverId: string | null;
                note: string | null;
                handledAt: Date | null;
            };
        };
    }>;
}
