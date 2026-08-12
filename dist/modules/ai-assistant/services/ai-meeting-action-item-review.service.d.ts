import { Model } from 'mongoose';
import { MeetingActionItemReviewStatus } from '../../../common/enums/meeting-action-item-review-status.enum';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { MeetingTranscriptDocument } from '../../meetings/schemas/meeting-transcript.schema';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksService } from '../../tasks/services/tasks.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { ApproveMeetingActionItemDto } from '../dto/approve-meeting-action-item.dto';
import { RejectMeetingActionItemDto } from '../dto/reject-meeting-action-item.dto';
import { MeetingActionItemReviewsRepository } from '../repositories/meeting-action-item-reviews.repository';
import { MeetingSummaryDocument } from '../schemas/meeting-summary.schema';
import { AiMeetingSummaryAccessService } from './ai-meeting-summary-access.service';
export declare class AiMeetingActionItemReviewService {
    private readonly meetingSummaryModel;
    private readonly reviewsRepository;
    private readonly summaryAccessService;
    private readonly projectAccessService;
    private readonly meetingAccessService;
    private readonly tasksService;
    private readonly tasksRepository?;
    private readonly meetingTranscriptModel?;
    constructor(meetingSummaryModel: Model<MeetingSummaryDocument> | null, reviewsRepository: MeetingActionItemReviewsRepository, summaryAccessService: AiMeetingSummaryAccessService, projectAccessService: ProjectAccessService, meetingAccessService: MeetingAccessService, tasksService: TasksService, tasksRepository?: TasksRepository | undefined, meetingTranscriptModel?: (Model<MeetingTranscriptDocument> | null) | undefined);
    getActionItems(currentUserId: string, workspaceId: string, projectId: string, summaryId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            canReview: boolean;
            items: {
                index: number;
                text: string;
                assigneeName: string | null;
                assigneeUserId: string | null;
                dueDate: string | null;
                aiStatus: string | null;
                source: string | null;
                reviewStatus: MeetingActionItemReviewStatus;
                createdTaskId: string | null;
                rejectionReason: string | null;
                reviewedAt: Date | null;
                duplicateCandidates: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: string;
                }[];
                confidence: number | null;
                citation: {
                    startedAt: string;
                    endedAt: string | null;
                    speakerName: string | null;
                    text: string;
                    confidence: number | null;
                } | null;
            }[];
        };
    }>;
    approveActionItem(currentUserId: string, workspaceId: string, projectId: string, summaryId: string, actionItemIndex: number, dto: ApproveMeetingActionItemDto): Promise<{
        success: boolean;
        message: string;
        data: {
            actionItem: {
                index: number;
                text: string;
                assigneeName: string | null;
                assigneeUserId: string | null;
                dueDate: string | null;
                aiStatus: string | null;
                source: string | null;
                reviewStatus: MeetingActionItemReviewStatus;
                createdTaskId: string | null;
                rejectionReason: string | null;
                reviewedAt: Date | null;
                duplicateCandidates: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: string;
                }[];
                confidence: number | null;
                citation: {
                    startedAt: string;
                    endedAt: string | null;
                    speakerName: string | null;
                    text: string;
                    confidence: number | null;
                } | null;
            };
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
                workflowStatusId: string | null;
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
                startedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
                isBlocked: boolean;
                isBlocking: boolean;
            };
        };
    }>;
    rejectActionItem(currentUserId: string, workspaceId: string, projectId: string, summaryId: string, actionItemIndex: number, dto: RejectMeetingActionItemDto): Promise<{
        success: boolean;
        message: string;
        data: {
            actionItem: {
                index: number;
                text: string;
                assigneeName: string | null;
                assigneeUserId: string | null;
                dueDate: string | null;
                aiStatus: string | null;
                source: string | null;
                reviewStatus: MeetingActionItemReviewStatus;
                createdTaskId: string | null;
                rejectionReason: string | null;
                reviewedAt: Date | null;
                duplicateCandidates: {
                    id: string;
                    taskCode: string;
                    title: string;
                    status: string;
                }[];
                confidence: number | null;
                citation: {
                    startedAt: string;
                    endedAt: string | null;
                    speakerName: string | null;
                    text: string;
                    confidence: number | null;
                } | null;
            };
        };
    }>;
    private getSummaryContext;
    private getActionItem;
    private assertPending;
    private buildTaskTitle;
    private buildTaskDescription;
    private normalizeDueDate;
    private toActionItemResponse;
    private findDuplicates;
    private normalizeText;
    private findCitation;
    private getSummaryModel;
}
