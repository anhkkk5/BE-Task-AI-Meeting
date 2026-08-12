import { Model } from 'mongoose';
import { AiReportReviewStatus } from '../../../common/enums/ai-report-review-status.enum';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { GenerateTeamReportDto } from '../dto/generate-team-report.dto';
import { GetAiTeamReportsQueryDto } from '../dto/get-ai-team-reports-query.dto';
import { UpdateTeamReportDto } from '../dto/update-team-report.dto';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import { AiReport, AiReportDocument, TeamDailyReportOutput } from '../schemas/ai-report.schema';
import { AiProviderService } from './ai-provider.service';
import { AiReportAccessService } from './ai-report-access.service';
import { AiReportEventsService } from './ai-report-events.service';
import { AiTeamReportDataBuilderService } from './ai-team-report-data-builder.service';
import { PromptBuilderService } from './prompt-builder.service';
export declare class AiTeamReportService {
    private readonly aiReportModel;
    private readonly aiPromptLogModel;
    private readonly aiProviderService;
    private readonly aiReportAccessService;
    private readonly dataBuilderService;
    private readonly projectAccessService;
    private readonly promptBuilderService;
    private readonly sprintAccessService;
    private readonly aiReportEventsService;
    private readonly rateLimitWindowMs;
    private readonly rateLimitMax;
    private readonly generateHits;
    constructor(aiReportModel: Model<AiReportDocument> | null, aiPromptLogModel: Model<AiPromptLogDocument> | null, aiProviderService: AiProviderService, aiReportAccessService: AiReportAccessService, dataBuilderService: AiTeamReportDataBuilderService, projectAccessService: ProjectAccessService, promptBuilderService: PromptBuilderService, sprintAccessService: SprintAccessService, aiReportEventsService: AiReportEventsService);
    generateTeamDailyReport(currentUserId: string, workspaceId: string, projectId: string, dto: GenerateTeamReportDto): Promise<{
        success: boolean;
        message: string;
        data: {
            report: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                citations?: import("../utils/report-citations").ReportCitation[] | undefined;
                claims?: import("../utils/report-citations").ReportClaim[] | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                reviewStatus: AiReportReviewStatus;
                metrics: import("../schemas/ai-report.schema").TeamReportMetrics | null;
                dataSources: import("../schemas/ai-report.schema").TeamReportDataSources | null;
                extraInstruction: string | null;
                editedBy: string | null;
                editedAt: Date | null;
                approvedBy: string | null;
                approvedAt: Date | null;
                createdBy: string;
            };
        };
    }>;
    generateScheduledTeamDailyReport(currentUserId: string, workspaceId: string, projectId: string, reportDate: string): Promise<{
        generated: boolean;
        reportId: string;
    }>;
    getTeamDailyReports(currentUserId: string, workspaceId: string, projectId: string, query: GetAiTeamReportsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                citations?: import("../utils/report-citations").ReportCitation[] | undefined;
                claims?: import("../utils/report-citations").ReportClaim[] | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                reviewStatus: AiReportReviewStatus;
                metrics: import("../schemas/ai-report.schema").TeamReportMetrics | null;
                dataSources: import("../schemas/ai-report.schema").TeamReportDataSources | null;
                extraInstruction: string | null;
                editedBy: string | null;
                editedAt: Date | null;
                approvedBy: string | null;
                approvedAt: Date | null;
                createdBy: string;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
    getLatestTeamDailyReport(currentUserId: string, workspaceId: string, projectId: string, query: GetAiTeamReportsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            report: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                citations?: import("../utils/report-citations").ReportCitation[] | undefined;
                claims?: import("../utils/report-citations").ReportClaim[] | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                reviewStatus: AiReportReviewStatus;
                metrics: import("../schemas/ai-report.schema").TeamReportMetrics | null;
                dataSources: import("../schemas/ai-report.schema").TeamReportDataSources | null;
                extraInstruction: string | null;
                editedBy: string | null;
                editedAt: Date | null;
                approvedBy: string | null;
                approvedAt: Date | null;
                createdBy: string;
            } | null;
        };
    }>;
    getTeamDailyReportDetail(currentUserId: string, workspaceId: string, projectId: string, reportId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            report: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                citations?: import("../utils/report-citations").ReportCitation[] | undefined;
                claims?: import("../utils/report-citations").ReportClaim[] | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                reviewStatus: AiReportReviewStatus;
                metrics: import("../schemas/ai-report.schema").TeamReportMetrics | null;
                dataSources: import("../schemas/ai-report.schema").TeamReportDataSources | null;
                extraInstruction: string | null;
                editedBy: string | null;
                editedAt: Date | null;
                approvedBy: string | null;
                approvedAt: Date | null;
                createdBy: string;
            };
            canManage: boolean;
        };
    }>;
    updateTeamDailyReport(currentUserId: string, workspaceId: string, projectId: string, reportId: string, dto: UpdateTeamReportDto): Promise<{
        success: boolean;
        message: string;
        data: {
            report: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                citations?: import("../utils/report-citations").ReportCitation[] | undefined;
                claims?: import("../utils/report-citations").ReportClaim[] | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                reviewStatus: AiReportReviewStatus;
                metrics: import("../schemas/ai-report.schema").TeamReportMetrics | null;
                dataSources: import("../schemas/ai-report.schema").TeamReportDataSources | null;
                extraInstruction: string | null;
                editedBy: string | null;
                editedAt: Date | null;
                approvedBy: string | null;
                approvedAt: Date | null;
                createdBy: string;
            };
        };
    }>;
    approveTeamDailyReport(currentUserId: string, workspaceId: string, projectId: string, reportId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            report: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                citations?: import("../utils/report-citations").ReportCitation[] | undefined;
                claims?: import("../utils/report-citations").ReportClaim[] | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                reviewStatus: AiReportReviewStatus;
                metrics: import("../schemas/ai-report.schema").TeamReportMetrics | null;
                dataSources: import("../schemas/ai-report.schema").TeamReportDataSources | null;
                extraInstruction: string | null;
                editedBy: string | null;
                editedAt: Date | null;
                approvedBy: string | null;
                approvedAt: Date | null;
                createdBy: string;
            };
        };
    }>;
    cancelTeamDailyReport(currentUserId: string, workspaceId: string, projectId: string, reportId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            report: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                citations?: import("../utils/report-citations").ReportCitation[] | undefined;
                claims?: import("../utils/report-citations").ReportClaim[] | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                reviewStatus: AiReportReviewStatus;
                metrics: import("../schemas/ai-report.schema").TeamReportMetrics | null;
                dataSources: import("../schemas/ai-report.schema").TeamReportDataSources | null;
                extraInstruction: string | null;
                editedBy: string | null;
                editedAt: Date | null;
                approvedBy: string | null;
                approvedAt: Date | null;
                createdBy: string;
            };
        };
    }>;
    private findTeamReportOrFail;
    findTeamReportForRead(currentUserId: string, workspaceId: string, projectId: string, reportId: string): Promise<{
        report: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, AiReport, {}, import("mongoose").DefaultSchemaOptions> & AiReport & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, AiReport, {}, import("mongoose").DefaultSchemaOptions> & AiReport & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
        canManage: boolean;
    }>;
    private loadTeamReport;
    private resolveReviewStatus;
    private findReports;
    private assertValidQuery;
    private buildMongoQuery;
    private assertGenerateRateLimit;
    private writePromptLog;
    private getReportModel;
    private getReportId;
    private normalizeDate;
    private toReportResponse;
}
