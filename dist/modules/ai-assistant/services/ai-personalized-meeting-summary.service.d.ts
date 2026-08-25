import { Model } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AiUserPreferencesService } from '../../users/services/ai-user-preferences.service';
import { GeneratePersonalizedMeetingSummaryDto } from '../dto/generate-personalized-meeting-summary.dto';
import { GetMyMeetingActionItemsQueryDto } from '../dto/get-my-meeting-action-items-query.dto';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import { MeetingSummaryDocument } from '../schemas/meeting-summary.schema';
import { PersonalizedMeetingSummaryDocument } from '../schemas/personalized-meeting-summary.schema';
import { AiPersonalizedMeetingSummaryAccessService } from './ai-personalized-meeting-summary-access.service';
import { AiPersonalizedMeetingSummaryDataBuilderService } from './ai-personalized-meeting-summary-data-builder.service';
import { AiProviderService } from './ai-provider.service';
import { PromptBuilderService } from './prompt-builder.service';
export declare class AiPersonalizedMeetingSummaryService {
    private readonly personalizedSummaryModel;
    private readonly meetingSummaryModel;
    private readonly aiPromptLogModel;
    private readonly accessService;
    private readonly dataBuilderService;
    private readonly aiProviderService;
    private readonly meetingAccessService;
    private readonly meetingParticipantsRepository;
    private readonly projectAccessService;
    private readonly promptBuilderService;
    private readonly workspaceAccessService;
    private readonly aiUserPreferencesService;
    private readonly rateLimitWindowMs;
    private readonly rateLimitMax;
    private readonly generateHits;
    constructor(personalizedSummaryModel: Model<PersonalizedMeetingSummaryDocument> | null, meetingSummaryModel: Model<MeetingSummaryDocument> | null, aiPromptLogModel: Model<AiPromptLogDocument> | null, accessService: AiPersonalizedMeetingSummaryAccessService, dataBuilderService: AiPersonalizedMeetingSummaryDataBuilderService, aiProviderService: AiProviderService, meetingAccessService: MeetingAccessService, meetingParticipantsRepository: MeetingParticipantsRepository, projectAccessService: ProjectAccessService, promptBuilderService: PromptBuilderService, workspaceAccessService: WorkspaceAccessService, aiUserPreferencesService: AiUserPreferencesService);
    generateMyPersonalizedMeetingSummary(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, dto?: GeneratePersonalizedMeetingSummaryDto): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    generateMemberPersonalizedMeetingSummary(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, memberId: string, dto?: GeneratePersonalizedMeetingSummaryDto): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    generateAllPersonalizedMeetingSummaries(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, dto?: GeneratePersonalizedMeetingSummaryDto): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            }[];
        };
    }>;
    generateAutomaticallyForParticipants(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
        generated: number;
        failed: number;
        total: number;
    }>;
    getMyPersonalizedMeetingSummary(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getMemberPersonalizedMeetingSummary(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, memberId: string): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getPersonalizedMeetingSummaryDetail(currentUserId: string, workspaceId: string, projectId: string, summaryId: string): Promise<{
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
                status: AiReportStatus;
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getMyMeetingActionItems(currentUserId: string, workspaceId: string, projectId: string, query: GetMyMeetingActionItemsQueryDto): Promise<{
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
    private generateForTargetUser;
    private findLatestMeetingSummary;
    private findLatestPersonalizedSummary;
    private assertGenerateRateLimit;
    private assertValidActionItemQuery;
    private matchesMeetingDateFilter;
    private extractMeetingDate;
    private toActionItemResponse;
    private writePromptLog;
    private getPersonalizedSummaryModel;
    private getMeetingSummaryModel;
    private getSummaryId;
    private normalizeDate;
    private toSummaryResponse;
}
