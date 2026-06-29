import type { AuthUser } from '../../auth/types/auth-user.type';
import { GenerateTeamReportDto } from '../dto/generate-team-report.dto';
import { GetAiTeamReportsQueryDto } from '../dto/get-ai-team-reports-query.dto';
import { AiTeamReportService } from '../services/ai-team-report.service';
export declare class AiTeamReportController {
    private readonly aiTeamReportService;
    constructor(aiTeamReportService: AiTeamReportService);
    generateTeamDailyReport(user: AuthUser, workspaceId: string, projectId: string, dto: GenerateTeamReportDto): Promise<{
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
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | import("../schemas/ai-report.schema").TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
            };
        };
    }>;
    getTeamDailyReports(user: AuthUser, workspaceId: string, projectId: string, query: GetAiTeamReportsQueryDto): Promise<{
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
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | import("../schemas/ai-report.schema").TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
    getLatestTeamDailyReport(user: AuthUser, workspaceId: string, projectId: string, query: GetAiTeamReportsQueryDto): Promise<{
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
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | import("../schemas/ai-report.schema").TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
            } | null;
        };
    }>;
    getTeamDailyReportDetail(user: AuthUser, workspaceId: string, projectId: string, reportId: string): Promise<{
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
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput | import("../schemas/ai-report.schema").TeamDailyReportOutput;
                summary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
            };
        };
    }>;
}
