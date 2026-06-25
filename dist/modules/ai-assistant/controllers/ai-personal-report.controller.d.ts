import type { AuthUser } from '../../auth/types/auth-user.type';
import { GeneratePersonalReportDto } from '../dto/generate-personal-report.dto';
import { GetAiReportsQueryDto } from '../dto/get-ai-reports-query.dto';
import { AiPersonalReportService } from '../services/ai-personal-report.service';
export declare class AiPersonalReportController {
    private readonly aiPersonalReportService;
    constructor(aiPersonalReportService: AiPersonalReportService);
    generateMyPersonalDailyReport(user: AuthUser, workspaceId: string, projectId: string, dto: GeneratePersonalReportDto): Promise<{
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
                userId: string;
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput;
                summary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
            };
        };
    }>;
    generateMemberPersonalDailyReport(user: AuthUser, workspaceId: string, projectId: string, memberId: string, dto: GeneratePersonalReportDto): Promise<{
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
                userId: string;
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput;
                summary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
            };
        };
    }>;
    getMyPersonalDailyReports(user: AuthUser, workspaceId: string, projectId: string, query: GetAiReportsQueryDto): Promise<{
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
                userId: string;
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput;
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
    getMemberPersonalDailyReports(user: AuthUser, workspaceId: string, projectId: string, memberId: string, query: GetAiReportsQueryDto): Promise<{
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
                userId: string;
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput;
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
    getPersonalDailyReportDetail(user: AuthUser, workspaceId: string, projectId: string, reportId: string): Promise<{
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
                userId: string;
                reportType: import("../../../common/enums/ai-report-type.enum").AiReportType;
                reportDate: string;
                aiOutput: import("../schemas/ai-report.schema").PersonalDailyReportOutput;
                summary: string;
                model: string | null;
                status: import("../../../common/enums/ai-report-status.enum").AiReportStatus;
                createdBy: string;
            };
        };
    }>;
}
