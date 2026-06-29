import { Model } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { GeneratePersonalReportDto } from '../dto/generate-personal-report.dto';
import { GetAiReportsQueryDto } from '../dto/get-ai-reports-query.dto';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import { AiReportDocument } from '../schemas/ai-report.schema';
import { AiProviderService } from './ai-provider.service';
import { AiReportAccessService } from './ai-report-access.service';
import { AiReportDataBuilderService } from './ai-report-data-builder.service';
import { PromptBuilderService } from './prompt-builder.service';
export declare class AiPersonalReportService {
    private readonly aiReportModel;
    private readonly aiPromptLogModel;
    private readonly aiProviderService;
    private readonly aiReportAccessService;
    private readonly dataBuilderService;
    private readonly projectAccessService;
    private readonly promptBuilderService;
    private readonly sprintAccessService;
    private readonly workspaceAccessService;
    constructor(aiReportModel: Model<AiReportDocument> | null, aiPromptLogModel: Model<AiPromptLogDocument> | null, aiProviderService: AiProviderService, aiReportAccessService: AiReportAccessService, dataBuilderService: AiReportDataBuilderService, projectAccessService: ProjectAccessService, promptBuilderService: PromptBuilderService, sprintAccessService: SprintAccessService, workspaceAccessService: WorkspaceAccessService);
    generateMyPersonalDailyReport(currentUserId: string, workspaceId: string, projectId: string, dto: GeneratePersonalReportDto): Promise<{
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
                userId: string | null | undefined;
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
    generateMemberPersonalDailyReport(currentUserId: string, workspaceId: string, projectId: string, memberId: string, dto: GeneratePersonalReportDto): Promise<{
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
                userId: string | null | undefined;
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
    getMyPersonalDailyReports(currentUserId: string, workspaceId: string, projectId: string, query: GetAiReportsQueryDto): Promise<{
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
                userId: string | null | undefined;
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
    getMemberPersonalDailyReports(currentUserId: string, workspaceId: string, projectId: string, memberId: string, query: GetAiReportsQueryDto): Promise<{
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
                userId: string | null | undefined;
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
    getPersonalDailyReportDetail(currentUserId: string, workspaceId: string, projectId: string, reportId: string): Promise<{
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
                userId: string | null | undefined;
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
    private generateReport;
    private findReports;
    private assertValidQuery;
    private writePromptLog;
    private getReportModel;
    private getReportId;
    private normalizeDate;
    private toReportResponse;
}
