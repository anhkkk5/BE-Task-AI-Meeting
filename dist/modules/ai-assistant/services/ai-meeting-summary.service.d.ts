import { Model } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { MeetingsRepository } from '../../meetings/repositories/meetings.repository';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { GenerateMeetingSummaryDto } from '../dto/generate-meeting-summary.dto';
import { GetMeetingSummariesQueryDto } from '../dto/get-meeting-summaries-query.dto';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import { MeetingSummaryDocument } from '../schemas/meeting-summary.schema';
import { AiMeetingSummaryAccessService } from './ai-meeting-summary-access.service';
import { AiMeetingSummaryDataBuilderService } from './ai-meeting-summary-data-builder.service';
import { AiProviderService } from './ai-provider.service';
import { PromptBuilderService } from './prompt-builder.service';
export declare class AiMeetingSummaryService {
    private readonly meetingSummaryModel;
    private readonly aiPromptLogModel;
    private readonly accessService;
    private readonly dataBuilderService;
    private readonly aiProviderService;
    private readonly meetingAccessService;
    private readonly meetingsRepository;
    private readonly projectAccessService;
    private readonly promptBuilderService;
    private readonly rateLimitWindowMs;
    private readonly rateLimitMax;
    private readonly generateHits;
    constructor(meetingSummaryModel: Model<MeetingSummaryDocument> | null, aiPromptLogModel: Model<AiPromptLogDocument> | null, accessService: AiMeetingSummaryAccessService, dataBuilderService: AiMeetingSummaryDataBuilderService, aiProviderService: AiProviderService, meetingAccessService: MeetingAccessService, meetingsRepository: MeetingsRepository, projectAccessService: ProjectAccessService, promptBuilderService: PromptBuilderService);
    generateMeetingSummary(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, dto?: GenerateMeetingSummaryDto): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getMeetingSummary(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getMeetingSummaries(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, query: GetMeetingSummariesQueryDto): Promise<{
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
                status: AiReportStatus;
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
    getMeetingSummaryDetail(currentUserId: string, workspaceId: string, projectId: string, summaryId: string): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    private findLatestSummary;
    private assertGenerateRateLimit;
    private writePromptLog;
    private getSummaryModel;
    private getSummaryId;
    private toSummaryResponse;
}
