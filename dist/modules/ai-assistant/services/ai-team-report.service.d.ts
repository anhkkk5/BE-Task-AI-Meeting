import { Model } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { GenerateTeamReportDto } from '../dto/generate-team-report.dto';
import { GetAiTeamReportsQueryDto } from '../dto/get-ai-team-reports-query.dto';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import { AiReportDocument } from '../schemas/ai-report.schema';
import { AiProviderService } from './ai-provider.service';
import { AiReportAccessService } from './ai-report-access.service';
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
    private readonly rateLimitWindowMs;
    private readonly rateLimitMax;
    private readonly generateHits;
    constructor(aiReportModel: Model<AiReportDocument> | null, aiPromptLogModel: Model<AiPromptLogDocument> | null, aiProviderService: AiProviderService, aiReportAccessService: AiReportAccessService, dataBuilderService: AiTeamReportDataBuilderService, projectAccessService: ProjectAccessService, promptBuilderService: PromptBuilderService, sprintAccessService: SprintAccessService);
    generateTeamDailyReport(currentUserId: string, workspaceId: string, projectId: string, dto: GenerateTeamReportDto): Promise<{
        success: boolean;
        message: string;
        data: {
            report: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | import("../schemas/ai-report.schema").TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                createdBy: string;
            };
        };
    }>;
    getTeamDailyReports(currentUserId: string, workspaceId: string, projectId: string, query: GetAiTeamReportsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
                inputData?: Record<string, unknown> | undefined;
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | import("../schemas/ai-report.schema").TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
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
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | import("../schemas/ai-report.schema").TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
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
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string | null;
                reportType: AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | import("../schemas/ai-report.schema").TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: AiReportStatus;
                createdBy: string;
            };
        };
    }>;
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
