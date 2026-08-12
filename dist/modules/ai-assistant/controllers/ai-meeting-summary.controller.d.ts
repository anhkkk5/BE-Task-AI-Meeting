import type { AuthUser } from '../../auth/types/auth-user.type';
import { GenerateMeetingSummaryDto } from '../dto/generate-meeting-summary.dto';
import { GetMeetingSummariesQueryDto } from '../dto/get-meeting-summaries-query.dto';
import { ApproveMeetingActionItemDto } from '../dto/approve-meeting-action-item.dto';
import { RejectMeetingActionItemDto } from '../dto/reject-meeting-action-item.dto';
import { AiMeetingActionItemReviewService } from '../services/ai-meeting-action-item-review.service';
import { AiMeetingSummaryService } from '../services/ai-meeting-summary.service';
export declare class AiMeetingSummaryController {
    private readonly aiMeetingSummaryService;
    constructor(aiMeetingSummaryService: AiMeetingSummaryService);
    generateMeetingSummary(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, dto: GenerateMeetingSummaryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                transcriptId: string;
                title: string;
                summary: string;
                keyPoints: string[];
                decisions: string[];
                actionItems: import("../schemas/meeting-summary.schema").MeetingSummaryActionItem[];
                risks: string[];
                openQuestions: string[];
                nextSteps: string[];
                aiOutput: import("../schemas/meeting-summary.schema").MeetingSummaryOutput;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getMeetingSummary(user: AuthUser, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                claims: {
                    id: string;
                    text: string;
                    kind: "FACT" | "INFERENCE" | "RECOMMENDATION";
                    category: "KEY_POINT" | "DECISION" | "BLOCKER" | "OPEN_QUESTION" | "RECOMMENDATION";
                    citation: {
                        startedAt: string;
                        endedAt: string | null;
                        segmentId: string | null;
                        speakerName: string | null;
                        text: string;
                        confidence: number | null;
                    } | null;
                }[];
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                transcriptId: string;
                title: string;
                summary: string;
                keyPoints: string[];
                decisions: string[];
                actionItems: import("../schemas/meeting-summary.schema").MeetingSummaryActionItem[];
                risks: string[];
                openQuestions: string[];
                nextSteps: string[];
                aiOutput: import("../schemas/meeting-summary.schema").MeetingSummaryOutput;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getMeetingSummaries(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, query: GetMeetingSummariesQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                transcriptId: string;
                title: string;
                summary: string;
                keyPoints: string[];
                decisions: string[];
                actionItems: import("../schemas/meeting-summary.schema").MeetingSummaryActionItem[];
                risks: string[];
                openQuestions: string[];
                nextSteps: string[];
                aiOutput: import("../schemas/meeting-summary.schema").MeetingSummaryOutput;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
}
export declare class AiMeetingSummaryDetailController {
    private readonly aiMeetingSummaryService;
    private readonly actionItemReviewService;
    constructor(aiMeetingSummaryService: AiMeetingSummaryService, actionItemReviewService: AiMeetingActionItemReviewService);
    getMeetingSummaryDetail(user: AuthUser, workspaceId: string, projectId: string, summaryId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                transcriptId: string;
                title: string;
                summary: string;
                keyPoints: string[];
                decisions: string[];
                actionItems: import("../schemas/meeting-summary.schema").MeetingSummaryActionItem[];
                risks: string[];
                openQuestions: string[];
                nextSteps: string[];
                aiOutput: import("../schemas/meeting-summary.schema").MeetingSummaryOutput;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getActionItems(user: AuthUser, workspaceId: string, projectId: string, summaryId: string): Promise<{
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
                reviewStatus: import("../../../common/enums/meeting-action-item-review-status.enum").MeetingActionItemReviewStatus;
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
    approveActionItem(user: AuthUser, workspaceId: string, projectId: string, summaryId: string, actionItemIndex: number, dto: ApproveMeetingActionItemDto): Promise<{
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
                reviewStatus: import("../../../common/enums/meeting-action-item-review-status.enum").MeetingActionItemReviewStatus;
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
                workflowStatusKey: import("../../../common/enums/task-status.enum").TaskStatus;
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
    rejectActionItem(user: AuthUser, workspaceId: string, projectId: string, summaryId: string, actionItemIndex: number, dto: RejectMeetingActionItemDto): Promise<{
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
                reviewStatus: import("../../../common/enums/meeting-action-item-review-status.enum").MeetingActionItemReviewStatus;
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
}
