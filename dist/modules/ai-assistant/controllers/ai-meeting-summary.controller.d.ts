import type { AuthUser } from '../../auth/types/auth-user.type';
import { GenerateMeetingSummaryDto } from '../dto/generate-meeting-summary.dto';
import { GetMeetingSummariesQueryDto } from '../dto/get-meeting-summaries-query.dto';
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
    constructor(aiMeetingSummaryService: AiMeetingSummaryService);
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
}
