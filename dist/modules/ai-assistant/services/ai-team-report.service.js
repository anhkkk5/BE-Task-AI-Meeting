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
exports.AiTeamReportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ai_report_review_status_enum_1 = require("../../../common/enums/ai-report-review-status.enum");
const ai_report_status_enum_1 = require("../../../common/enums/ai-report-status.enum");
const ai_report_type_enum_1 = require("../../../common/enums/ai-report-type.enum");
const project_access_service_1 = require("../../projects/services/project-access.service");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const ai_prompt_log_schema_1 = require("../schemas/ai-prompt-log.schema");
const ai_report_schema_1 = require("../schemas/ai-report.schema");
const ai_provider_service_1 = require("./ai-provider.service");
const ai_report_access_service_1 = require("./ai-report-access.service");
const ai_report_events_service_1 = require("./ai-report-events.service");
const ai_team_report_data_builder_service_1 = require("./ai-team-report-data-builder.service");
const report_citations_1 = require("../utils/report-citations");
const prompt_builder_service_1 = require("./prompt-builder.service");
let AiTeamReportService = class AiTeamReportService {
    aiReportModel;
    aiPromptLogModel;
    aiProviderService;
    aiReportAccessService;
    dataBuilderService;
    projectAccessService;
    promptBuilderService;
    sprintAccessService;
    aiReportEventsService;
    rateLimitWindowMs = 10 * 60 * 1000;
    rateLimitMax = 5;
    generateHits = new Map();
    constructor(aiReportModel, aiPromptLogModel, aiProviderService, aiReportAccessService, dataBuilderService, projectAccessService, promptBuilderService, sprintAccessService, aiReportEventsService) {
        this.aiReportModel = aiReportModel;
        this.aiPromptLogModel = aiPromptLogModel;
        this.aiProviderService = aiProviderService;
        this.aiReportAccessService = aiReportAccessService;
        this.dataBuilderService = dataBuilderService;
        this.projectAccessService = projectAccessService;
        this.promptBuilderService = promptBuilderService;
        this.sprintAccessService = sprintAccessService;
        this.aiReportEventsService = aiReportEventsService;
    }
    async generateTeamDailyReport(currentUserId, workspaceId, projectId, dto) {
        const reportModel = this.getReportModel();
        await this.aiReportAccessService.assertCanUseTeamReports(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        if (dto.sprintId) {
            await this.sprintAccessService.assertSprintInProject(dto.sprintId, projectId);
        }
        this.assertGenerateRateLimit(workspaceId, projectId);
        const inputData = await this.dataBuilderService.buildTeamReportInput({
            workspaceId,
            projectId,
            reportDate: dto.reportDate,
            sprintId: dto.sprintId,
            dataSources: dto.dataSources,
        });
        const prompt = this.promptBuilderService.buildTeamDailyReportPrompt(inputData, dto.extraInstruction);
        const startedAt = Date.now();
        try {
            const aiResult = await this.aiProviderService.generateTeamDailyReport(prompt, inputData);
            const report = await reportModel.create({
                workspaceId,
                projectId,
                sprintId: dto.sprintId ?? null,
                userId: null,
                reportType: ai_report_type_enum_1.AiReportType.TeamDailyReport,
                reportDate: inputData.reportDate,
                inputData,
                aiOutput: aiResult.output,
                aiModel: aiResult.model,
                status: ai_report_status_enum_1.AiReportStatus.Completed,
                reviewStatus: ai_report_review_status_enum_1.AiReportReviewStatus.PendingReview,
                metrics: this.dataBuilderService.computeMetrics(inputData),
                dataSources: inputData.dataSources,
                extraInstruction: dto.extraInstruction?.trim() || null,
                createdBy: currentUserId,
            });
            await this.writePromptLog({
                workspaceId,
                projectId,
                userId: currentUserId,
                model: aiResult.model,
                prompt,
                response: aiResult.rawResponse,
                responseTimeMs: Date.now() - startedAt,
                success: true,
            });
            return {
                success: true,
                message: 'Generate team daily report successfully',
                data: {
                    report: this.toReportResponse(report, true),
                },
            };
        }
        catch (error) {
            await this.writePromptLog({
                workspaceId,
                projectId,
                userId: currentUserId,
                model: process.env.AI_MODEL ?? 'mock-team-report',
                prompt,
                response: '',
                responseTimeMs: Date.now() - startedAt,
                success: false,
                errorMessage: error instanceof Error ? error.message : 'AI provider failed',
            });
            throw new common_1.ServiceUnavailableException('AI provider failed');
        }
    }
    async generateScheduledTeamDailyReport(currentUserId, workspaceId, projectId, reportDate) {
        const reportModel = this.getReportModel();
        const normalizedDate = this.normalizeDate(reportDate);
        const existingReport = await reportModel
            .findOne({
            workspaceId,
            projectId,
            sprintId: null,
            userId: null,
            reportType: ai_report_type_enum_1.AiReportType.TeamDailyReport,
            reportDate: normalizedDate,
        })
            .exec();
        if (existingReport) {
            return {
                generated: false,
                reportId: this.getReportId(existingReport),
            };
        }
        const response = await this.generateTeamDailyReport(currentUserId, workspaceId, projectId, { reportDate: normalizedDate });
        return {
            generated: true,
            reportId: response.data.report.id,
        };
    }
    async getTeamDailyReports(currentUserId, workspaceId, projectId, query) {
        await this.aiReportAccessService.assertCanUseTeamReports(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.assertValidQuery(projectId, query);
        const result = await this.findReports(workspaceId, projectId, query);
        return {
            success: true,
            message: 'Get team daily reports successfully',
            data: result,
        };
    }
    async getLatestTeamDailyReport(currentUserId, workspaceId, projectId, query) {
        const reportModel = this.getReportModel();
        await this.aiReportAccessService.assertCanUseTeamReports(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.assertValidQuery(projectId, query);
        const mongoQuery = this.buildMongoQuery(workspaceId, projectId, query);
        const report = await reportModel
            .findOne(mongoQuery)
            .sort({ reportDate: -1, createdAt: -1 })
            .exec();
        return {
            success: true,
            message: 'Get latest team daily report successfully',
            data: {
                report: report ? this.toReportResponse(report, false) : null,
            },
        };
    }
    async getTeamDailyReportDetail(currentUserId, workspaceId, projectId, reportId) {
        const { report, canManage } = await this.findTeamReportForRead(currentUserId, workspaceId, projectId, reportId);
        return {
            success: true,
            message: 'Get team daily report detail successfully',
            data: {
                report: this.toReportResponse(report, canManage),
                canManage,
            },
        };
    }
    async updateTeamDailyReport(currentUserId, workspaceId, projectId, reportId, dto) {
        const report = await this.findTeamReportOrFail(currentUserId, workspaceId, projectId, reportId);
        const currentStatus = this.resolveReviewStatus(report);
        if ((0, ai_report_review_status_enum_1.isFinalReviewStatus)(currentStatus)) {
            throw new common_1.ConflictException(currentStatus === ai_report_review_status_enum_1.AiReportReviewStatus.Cancelled
                ? 'Phiên giao ban đã bị hủy nên không thể chỉnh sửa'
                : 'Báo cáo đã được duyệt nên không thể chỉnh sửa');
        }
        const currentOutput = (report.aiOutput ?? {});
        const patch = {};
        if (dto.summary !== undefined)
            patch.summary = dto.summary;
        if (dto.teamProgress !== undefined)
            patch.teamProgress = dto.teamProgress;
        if (dto.completedWork !== undefined)
            patch.completedWork = dto.completedWork;
        if (dto.todayFocus !== undefined)
            patch.todayFocus = dto.todayFocus;
        if (dto.blockers !== undefined)
            patch.blockers = dto.blockers;
        if (dto.risks !== undefined)
            patch.risks = dto.risks;
        if (dto.recommendations !== undefined) {
            patch.recommendations = dto.recommendations;
        }
        if (!Object.keys(patch).length) {
            throw new common_1.BadRequestException('Không có nội dung nào được thay đổi');
        }
        report.aiOutput = { ...currentOutput, ...patch };
        report.reviewStatus = ai_report_review_status_enum_1.AiReportReviewStatus.PendingReview;
        report.editedBy = currentUserId;
        report.editedAt = new Date();
        report.markModified('aiOutput');
        await report.save();
        return {
            success: true,
            message: 'Update team daily report successfully',
            data: {
                report: this.toReportResponse(report, true),
            },
        };
    }
    async approveTeamDailyReport(currentUserId, workspaceId, projectId, reportId) {
        const report = await this.findTeamReportOrFail(currentUserId, workspaceId, projectId, reportId);
        const currentStatus = this.resolveReviewStatus(report);
        if (currentStatus === ai_report_review_status_enum_1.AiReportReviewStatus.Published) {
            throw new common_1.ConflictException('Báo cáo này đã được duyệt trước đó');
        }
        if (currentStatus === ai_report_review_status_enum_1.AiReportReviewStatus.Cancelled) {
            throw new common_1.ConflictException('Phiên giao ban đã bị hủy nên không thể duyệt');
        }
        report.reviewStatus = ai_report_review_status_enum_1.AiReportReviewStatus.Published;
        report.approvedBy = currentUserId;
        report.approvedAt = new Date();
        await report.save();
        this.aiReportEventsService.publish({
            type: 'team_report_approved',
            reportId: this.getReportId(report),
            workspaceId,
            projectId,
            reportDate: report.reportDate,
            approvedBy: currentUserId,
            title: report.aiOutput?.title ?? null,
            summary: report.aiOutput?.summary ?? null,
        });
        return {
            success: true,
            message: 'Approve team daily report successfully',
            data: {
                report: this.toReportResponse(report, true),
            },
        };
    }
    async cancelTeamDailyReport(currentUserId, workspaceId, projectId, reportId) {
        const report = await this.findTeamReportOrFail(currentUserId, workspaceId, projectId, reportId);
        const currentStatus = this.resolveReviewStatus(report);
        if (currentStatus === ai_report_review_status_enum_1.AiReportReviewStatus.Published) {
            throw new common_1.ConflictException('Báo cáo đã duyệt và gửi cho cả nhóm nên không thể hủy');
        }
        if (currentStatus === ai_report_review_status_enum_1.AiReportReviewStatus.Cancelled) {
            throw new common_1.ConflictException('Phiên giao ban này đã bị hủy trước đó');
        }
        report.reviewStatus = ai_report_review_status_enum_1.AiReportReviewStatus.Cancelled;
        report.editedBy = currentUserId;
        report.editedAt = new Date();
        await report.save();
        return {
            success: true,
            message: 'Cancel team daily report successfully',
            data: {
                report: this.toReportResponse(report, true),
            },
        };
    }
    async findTeamReportOrFail(currentUserId, workspaceId, projectId, reportId) {
        await this.aiReportAccessService.assertCanUseTeamReports(currentUserId, workspaceId);
        return this.loadTeamReport(workspaceId, projectId, reportId);
    }
    async findTeamReportForRead(currentUserId, workspaceId, projectId, reportId) {
        const role = await this.aiReportAccessService.assertCanViewTeamReport(currentUserId, workspaceId);
        const canManage = this.aiReportAccessService.isManagerRole(role);
        const report = await this.loadTeamReport(workspaceId, projectId, reportId);
        if (!canManage &&
            this.resolveReviewStatus(report) !== ai_report_review_status_enum_1.AiReportReviewStatus.Published) {
            throw new common_1.ForbiddenException('Báo cáo giao ban này chưa được phát hành cho cả nhóm');
        }
        return { report, canManage };
    }
    async loadTeamReport(workspaceId, projectId, reportId) {
        const reportModel = this.getReportModel();
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const report = await reportModel.findById(reportId).exec();
        if (!report ||
            report.workspaceId !== workspaceId ||
            report.projectId !== projectId ||
            report.reportType !== ai_report_type_enum_1.AiReportType.TeamDailyReport) {
            throw new common_1.NotFoundException('Report not found in this project');
        }
        return report;
    }
    resolveReviewStatus(report) {
        return (0, ai_report_review_status_enum_1.normalizeReviewStatus)(report.reviewStatus);
    }
    async findReports(workspaceId, projectId, query) {
        const reportModel = this.getReportModel();
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const mongoQuery = this.buildMongoQuery(workspaceId, projectId, query);
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
    buildMongoQuery(workspaceId, projectId, query) {
        const mongoQuery = {
            workspaceId,
            projectId,
            reportType: ai_report_type_enum_1.AiReportType.TeamDailyReport,
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
        return mongoQuery;
    }
    assertGenerateRateLimit(workspaceId, projectId) {
        const key = `${workspaceId}:${projectId}`;
        const now = Date.now();
        const validHits = (this.generateHits.get(key) ?? []).filter((hit) => now - hit < this.rateLimitWindowMs);
        if (validHits.length >= this.rateLimitMax) {
            throw new common_1.HttpException('Too many AI team report requests for this project', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        validHits.push(now);
        this.generateHits.set(key, validHits);
    }
    async writePromptLog(payload) {
        if (!this.aiPromptLogModel) {
            return;
        }
        await this.aiPromptLogModel.create({
            workspaceId: payload.workspaceId,
            projectId: payload.projectId,
            userId: payload.userId,
            feature: ai_report_type_enum_1.AiReportType.TeamDailyReport,
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
            userId: report.userId ?? null,
            reportType: report.reportType,
            reportDate: report.reportDate,
            aiOutput: report.aiOutput,
            summary: report.aiOutput?.summary ?? null,
            model: report.aiModel ?? null,
            status: report.status,
            reviewStatus: this.resolveReviewStatus(report),
            metrics: report.metrics ?? null,
            dataSources: report.dataSources ?? null,
            extraInstruction: report.extraInstruction ?? null,
            editedBy: report.editedBy ?? null,
            editedAt: report.editedAt ?? null,
            approvedBy: report.approvedBy ?? null,
            approvedAt: report.approvedAt ?? null,
            createdBy: report.createdBy,
            ...(includeInputData ? { inputData: report.inputData, citations: (0, report_citations_1.buildReportCitations)(report.inputData), claims: (0, report_citations_1.buildReportClaims)(report.aiOutput, report.inputData) } : {}),
            createdAt: stampedReport.createdAt,
            updatedAt: stampedReport.updatedAt,
        };
    }
};
exports.AiTeamReportService = AiTeamReportService;
exports.AiTeamReportService = AiTeamReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(ai_report_schema_1.AiReport.name)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, mongoose_1.InjectModel)(ai_prompt_log_schema_1.AiPromptLog.name)),
    __metadata("design:paramtypes", [Object, Object, ai_provider_service_1.AiProviderService,
        ai_report_access_service_1.AiReportAccessService,
        ai_team_report_data_builder_service_1.AiTeamReportDataBuilderService,
        project_access_service_1.ProjectAccessService,
        prompt_builder_service_1.PromptBuilderService,
        sprint_access_service_1.SprintAccessService,
        ai_report_events_service_1.AiReportEventsService])
], AiTeamReportService);
//# sourceMappingURL=ai-team-report.service.js.map