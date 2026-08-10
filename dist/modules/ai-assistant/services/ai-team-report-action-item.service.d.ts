import { Model } from 'mongoose';
import { TeamReportActionItemSource, TeamReportActionItemStatus } from '../../../common/enums/team-report-action-item-status.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { TasksService } from '../../tasks/services/tasks.service';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { CreateTeamReportTaskDto } from '../dto/create-team-report-task.dto';
import { DismissTeamReportActionItemDto } from '../dto/dismiss-team-report-action-item.dto';
import { RequestTeamReportHandoverDto } from '../dto/request-team-report-handover.dto';
import { TeamReportActionItemsRepository } from '../repositories/team-report-action-items.repository';
import { AiReportDocument } from '../schemas/ai-report.schema';
import { AiReportAccessService } from './ai-report-access.service';
export declare class AiTeamReportActionItemService {
    private readonly aiReportModel;
    private readonly actionItemsRepository;
    private readonly aiReportAccessService;
    private readonly projectAccessService;
    private readonly tasksService;
    private readonly tasksRepository;
    private readonly workspaceMembers;
    constructor(aiReportModel: Model<AiReportDocument> | null, actionItemsRepository: TeamReportActionItemsRepository, aiReportAccessService: AiReportAccessService, projectAccessService: ProjectAccessService, tasksService: TasksService, tasksRepository: TasksRepository, workspaceMembers: WorkspaceMembersRepository);
    getActionItems(currentUserId: string, workspaceId: string, projectId: string, reportId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                itemIndex: number;
                source: TeamReportActionItemSource;
                text: string;
                status: TeamReportActionItemStatus;
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
    createTaskFromActionItem(currentUserId: string, workspaceId: string, projectId: string, reportId: string, dto: CreateTeamReportTaskDto): Promise<{
        success: boolean;
        message: string;
        data: {
            item: {
                itemIndex: number;
                source: TeamReportActionItemSource;
                text: string;
                status: TeamReportActionItemStatus;
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
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    requestHandoverFromActionItem(currentUserId: string, workspaceId: string, projectId: string, reportId: string, dto: RequestTeamReportHandoverDto): Promise<{
        success: boolean;
        message: string;
        data: {
            item: {
                itemIndex: number;
                source: TeamReportActionItemSource;
                text: string;
                status: TeamReportActionItemStatus;
                createdTaskId: string | null;
                targetTaskId: string | null;
                suggestedReceiverId: string | null;
                handoverId: string | null;
                note: string | null;
                handledAt: Date | null;
            };
        };
    }>;
    dismissActionItem(currentUserId: string, workspaceId: string, projectId: string, reportId: string, source: TeamReportActionItemSource, itemIndex: number, dto: DismissTeamReportActionItemDto): Promise<{
        success: boolean;
        message: string;
        data: {
            item: {
                itemIndex: number;
                source: TeamReportActionItemSource;
                text: string;
                status: TeamReportActionItemStatus;
                createdTaskId: string | null;
                targetTaskId: string | null;
                suggestedReceiverId: string | null;
                handoverId: string | null;
                note: string | null;
                handledAt: Date | null;
            };
        };
    }>;
    private findPendingItem;
    private buildConflictMessage;
    private findReportOrFail;
    private findReportForRead;
    private loadReport;
    private getItemText;
    private assertActiveMember;
    private collectItems;
    private buildKey;
    private toItemResponse;
    private buildTaskTitle;
    private buildTaskDescription;
    private getReportModel;
}
