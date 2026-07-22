"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiPersonalReportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ai_report_status_enum_1 = require("../../../common/enums/ai-report-status.enum");
const ai_report_type_enum_1 = require("../../../common/enums/ai-report-type.enum");
const project_access_service_1 = require("../../projects/services/project-access.service");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const ai_prompt_log_schema_1 = require("../schemas/ai-prompt-log.schema");
const ai_report_schema_1 = require("../schemas/ai-report.schema");
const ai_provider_service_1 = require("./ai-provider.service");
const ai_report_access_service_1 = require("./ai-report-access.service");
const ai_report_data_builder_service_1 = require("./ai-report-data-builder.service");
const prompt_builder_service_1 = require("./prompt-builder.service");
let AiPersonalReportService = class AiPersonalReportService {
    aiReportModel;
    aiPromptLogModel;
    aiProviderService;
    aiReportAccessService;
    dataBuilderService;
    projectAccessService;
    promptBuilderService;
    sprintAccessService;
    workspaceAccessService;
    constructor(aiReportModel, aiPromptLogModel, aiProviderService, aiReportAccessService, dataBuilderService, projectAccessService, promptBuilderService, sprintAccessService, workspaceAccessService) {
        this.aiReportModel = aiReportModel;
        this.aiPromptLogModel = aiPromptLogModel;
        this.aiProviderService = aiProviderService;
        this.aiReportAccessService = aiReportAccessService;
        this.dataBuilderService = dataBuilderService;
        this.projectAccessService = projectAccessService;
        this.promptBuilderService = promptBuilderService;
        this.sprintAccessService = sprintAccessService;
        this.workspaceAccessService = workspaceAccessService;
    }
    generateMyPersonalDailyReport(currentUserId, workspaceId, projectId, dto) {
        return this.generateReport({
            currentUserId,
            workspaceId,
            projectId,
            targetUserId: currentUserId,
            dto,
            message: 'Generate personal daily report successfully',
            managerMode: false,
        });
    }
    generateMemberPersonalDailyReport(currentUserId, workspaceId, projectId, memberId, dto) {
        return this.generateReport({
            currentUserId,
            workspaceId,
            projectId,
            targetUserId: memberId,
            dto,
            message: 'Generate member personal daily report successfully',
            managerMode: true,
        });
    }
    async generateScheduledPersonalDailyReport(currentUserId, workspaceId, projectId, memberId, reportDate) {
        const reportModel = this.getReportModel();
        const normalizedDate = this.normalizeDate(reportDate);
        const existingReport = await reportModel
            .findOne({
            workspaceId,
            projectId,
            sprintId: null,
            userId: memberId,
            reportType: ai_report_type_enum_1.AiReportType.PersonalDailyReport,
            reportDate: normalizedDate,
        })
            .exec();
        if (existingReport) {
            return {
                generated: false,
                reportId: this.getReportId(existingReport),
            };
        }
        const response = await this.generateMemberPersonalDailyReport(currentUserId, workspaceId, projectId, memberId, { reportDate: normalizedDate });
        return {
            generated: true,
            reportId: response.data.report.id,
        };
    }
    async getMyPersonalDailyReports(currentUserId, workspaceId, projectId, query) {
        await this.aiReportAccessService.assertCanUseOwnReports(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.assertValidQuery(projectId, query);
        const result = await this.findReports(workspaceId, projectId, query, {
            userId: currentUserId,
        });
        return {
            success: true,
            message: 'Get my personal daily reports successfully',
            data: result,
        };
    }
    async getMemberPersonalDailyReports(currentUserId, workspaceId, projectId, memberId, query) {
        await this.aiReportAccessService.assertCanManageMemberReports(currentUserId, workspaceId);
        await this.workspaceAccessService.assertWorkspaceMember(memberId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.assertValidQuery(projectId, query);
        const result = await this.findReports(workspaceId, projectId, query, {
            userId: memberId,
        });
        return {
            success: true,
            message: 'Get member personal daily reports successfully',
            data: result,
        };
    }
    async getPersonalDailyReportDetail(currentUserId, workspaceId, projectId, reportId) {
        const reportModel = this.getReportModel();
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const report = await reportModel.findById(reportId).exec();
        if (!report ||
            report.workspaceId !== workspaceId ||
            report.projectId !== projectId ||
            report.reportType !== ai_report_type_enum_1.AiReportType.PersonalDailyReport) {
            throw new common_1.NotFoundException('Report not found in this project');
        }
        await this.aiReportAccessService.assertCanViewReport(currentUserId, workspaceId, report);
        return {
            success: true,
            message: 'Get personal daily report detail successfully',
            data: {
                report: this.toReportResponse(report, true),
            },
        };
    }
    async generateReport(params) {
        const reportModel = this.getReportModel();
        if (params.managerMode) {
            await this.aiReportAccessService.assertCanManageMemberReports(params.currentUserId, params.workspaceId);
            await this.workspaceAccessService.assertWorkspaceMember(params.targetUserId, params.workspaceId);
        }
        else {
            await this.aiReportAccessService.assertCanUseOwnReports(params.currentUserId, params.workspaceId);
        }
        await this.projectAccessService.assertProjectInWorkspace(params.projectId, params.workspaceId);
        if (params.dto.sprintId) {
            await this.sprintAccessService.assertSprintInProject(params.dto.sprintId, params.projectId);
        }
        const inputData = await this.dataBuilderService.buildPersonalDailyReportInput({
            workspaceId: params.workspaceId,
            projectId: params.projectId,
            targetUserId: params.targetUserId,
            reportDate: params.dto.reportDate,
            sprintId: params.dto.sprintId,
        });
        const prompt = this.promptBuilderService.buildPersonalDailyReportPrompt(inputData);
        const startedAt = Date.now();
        try {
            const aiResult = await this.aiProviderService.generatePersonalDailyReport(prompt, inputData);
            const report = await reportModel.create({
                workspaceId: params.workspaceId,
                projectId: params.projectId,
                sprintId: params.dto.sprintId ?? null,
                userId: params.targetUserId,
                reportType: ai_report_type_enum_1.AiReportType.PersonalDailyReport,
                reportDate: inputData.reportDate,
                inputData,
                aiOutput: aiResult.output,
                aiModel: aiResult.model,
                status: ai_report_status_enum_1.AiReportStatus.Completed,
                createdBy: params.currentUserId,
            });
            await this.writePromptLog({
                workspaceId: params.workspaceId,
                projectId: params.projectId,
                userId: params.targetUserId,
                model: aiResult.model,
                prompt,
                response: aiResult.rawResponse,
                responseTimeMs: Date.now() - startedAt,
                success: true,
            });
            return {
                success: true,
                message: params.message,
                data: {
                    report: this.toReportResponse(report, true),
                },
            };
        }
        catch (error) {
            await this.writePromptLog({
                workspaceId: params.workspaceId,
                projectId: params.projectId,
                userId: params.targetUserId,
                model: process.env.AI_MODEL ?? 'mock-personal-report',
                prompt,
                response: '',
                responseTimeMs: Date.now() - startedAt,
                success: false,
                errorMessage: error instanceof Error ? error.message : 'AI provider failed',
            });
            throw new common_1.ServiceUnavailableException('AI provider failed');
        }
    }
    async findReports(workspaceId, projectId, query, options) {
        const reportModel = this.getReportModel();
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const mongoQuery = {
            workspaceId,
            projectId,
            reportType: ai_report_type_enum_1.AiReportType.PersonalDailyReport,
            userId: options.userId,
        };
        if (query.sprintId) {
            mongoQuery.sprintId = query.sprintId;
        }
        if (query.fromDate || query.toDate) {
            mongoQuery.reportDate = {};
            if (query.fromDate) {
                mongoQuery.reportDate.$gte = this.normalizeDate(query.fromDate);
            }
            if (query.toDate) {
                mongoQuery.reportDate.$lte = this.normalizeDate(query.toDate);
            }
        }
        const [items, total] = await Promise.all([
            reportModel
                .find(mongoQuery)
                .sort({ reportDate: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            reportModel.countDocuments(mongoQuery).exec(),
        ]);
        return {
            items: items.map((report) => this.toReportResponse(report, false)),
            meta: {
                total,
                page,
                limit,
            },
        };
    }
    async assertValidQuery(projectId, query) {
        if (query.fromDate && query.toDate) {
            const fromDate = this.normalizeDate(query.fromDate);
            const toDate = this.normalizeDate(query.toDate);
            if (fromDate > toDate) {
                throw new common_1.BadRequestException('fromDate must be before or equal to toDate');
            }
        }
        if (query.sprintId) {
            await this.sprintAccessService.assertSprintInProject(query.sprintId, projectId);
        }
    }
    async writePromptLog(payload) {
        if (!this.aiPromptLogModel) {
            return;
        }
        await this.aiPromptLogModel.create({
            workspaceId: payload.workspaceId,
            projectId: payload.projectId,
            userId: payload.userId,
            feature: ai_report_type_enum_1.AiReportType.PersonalDailyReport,
            aiModel: payload.model,
            prompt: payload.prompt,
            response: payload.response,
            responseTimeMs: payload.responseTimeMs,
            success: payload.success,
            errorMessage: payload.errorMessage ?? null,
        });
    }
    getReportModel() {
        if (!this.aiReportModel) {
            throw new common_1.ServiceUnavailableException('MongoDB is disabled');
        }
        return this.aiReportModel;
    }
    getReportId(report) {
        return report._id.toString();
    }
    normalizeDate(value) {
        return value.slice(0, 10);
    }
    toReportResponse(report, includeInputData) {
        const stampedReport = report;
        return {
            id: this.getReportId(report),
            workspaceId: report.workspaceId,
            projectId: report.projectId,
            sprintId: report.sprintId ?? null,
            userId: report.userId,
            reportType: report.reportType,
            reportDate: report.reportDate,
            aiOutput: report.aiOutput,
            summary: report.aiOutput?.summary ?? null,
            model: report.aiModel ?? null,
            status: report.status,
            createdBy: report.createdBy,
            ...(includeInputData ? { inputData: report.inputData } : {}),
            createdAt: stampedReport.createdAt,
            updatedAt: stampedReport.updatedAt,
        };
    }
};
exports.AiPersonalReportService = AiPersonalReportService;
exports.AiPersonalReportService = AiPersonalReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(ai_report_schema_1.AiReport.name)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, mongoose_1.InjectModel)(ai_prompt_log_schema_1.AiPromptLog.name)),
    __metadata("design:paramtypes", [Object, Object, ai_provider_service_1.AiProviderService,
        ai_report_access_service_1.AiReportAccessService,
        ai_report_data_builder_service_1.AiReportDataBuilderService,
        project_access_service_1.ProjectAccessService,
        prompt_builder_service_1.PromptBuilderService,
        sprint_access_service_1.SprintAccessService,
        workspace_access_service_1.WorkspaceAccessService])
], AiPersonalReportService);
//# sourceMappingURL=ai-personal-report.service.js.map