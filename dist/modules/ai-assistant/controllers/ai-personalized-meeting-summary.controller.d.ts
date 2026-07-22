import type { AuthUser } from '../../auth/types/auth-user.type';
import { GeneratePersonalizedMeetingSummaryDto } from '../dto/generate-personalized-meeting-summary.dto';
import { GetMyMeetingActionItemsQueryDto } from '../dto/get-my-meeting-action-items-query.dto';
import { AiPersonalizedMeetingSummaryService } from '../services/ai-personalized-meeting-summary.service';
export declare class AiPersonalizedMeetingSummaryController {
    private readonly personalizedMeetingSummaryService;
    constructor(personalizedMeetingSummaryService: AiPersonalizedMeetingSummaryService);
    generateMyPersonalizedMeetingSummary(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, dto: GeneratePersonalizedMeetingSummaryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                userId: string;
                sourceSummaryId: string;
                transcriptId: string | null;
                aiOutput: import("../schemas/personalized-meeting-summary.schema").PersonalizedMeetingSummaryOutput;
                personalSummary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    generateMemberPersonalizedMeetingSummary(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, memberId: string, dto: GeneratePersonalizedMeetingSummaryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                userId: string;
                sourceSummaryId: string;
                transcriptId: string | null;
                aiOutput: import("../schemas/personalized-meeting-summary.schema").PersonalizedMeetingSummaryOutput;
                personalSummary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    generateAllPersonalizedMeetingSummaries(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, dto: GeneratePersonalizedMeetingSummaryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                userId: string;
                sourceSummaryId: string;
                transcriptId: string | null;
                aiOutput: import("../schemas/personalized-meeting-summary.schema").PersonalizedMeetingSummaryOutput;
                personalSummary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            }[];
        };
    }>;
    getMyPersonalizedMeetingSummary(user: AuthUser, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                userId: string;
                sourceSummaryId: string;
                transcriptId: string | null;
                aiOutput: import("../schemas/personalized-meeting-summary.schema").PersonalizedMeetingSummaryOutput;
                personalSummary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getMemberPersonalizedMeetingSummary(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                userId: string;
                sourceSummaryId: string;
                transcriptId: string | null;
                aiOutput: import("../schemas/personalized-meeting-summary.schema").PersonalizedMeetingSummaryOutput;
                personalSummary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
}
export declare class AiPersonalizedMeetingSummaryProjectController {
    private readonly personalizedMeetingSummaryService;
    constructor(personalizedMeetingSummaryService: AiPersonalizedMeetingSummaryService);
    getPersonalizedMeetingSummaryDetail(user: AuthUser, workspaceId: string, projectId: string, summaryId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                meetingId: string;
                userId: string;
                sourceSummaryId: string;
                transcriptId: string | null;
                aiOutput: import("../schemas/personalized-meeting-summary.schema").PersonalizedMeetingSummaryOutput;
                personalSummary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getMyMeetingActionItems(user: AuthUser, workspaceId: string, projectId: string, query: GetMyMeetingActionItemsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                meetingId: string;
                meetingTitle: string | null;
                meetingDate: string | null;
                summaryId: string;
                title: string;
                assigneeId: string | null;
                assigneeName: string | null;
                deadline: string | null;
                source: string | null;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
}
