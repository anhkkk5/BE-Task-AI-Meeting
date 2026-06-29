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
exports.AiMeetingSummaryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ai_report_status_enum_1 = require("../../../common/enums/ai-report-status.enum");
const ai_report_type_enum_1 = require("../../../common/enums/ai-report-type.enum");
const meetings_repository_1 = require("../../meetings/repositories/meetings.repository");
const meeting_access_service_1 = require("../../meetings/services/meeting-access.service");
const project_access_service_1 = require("../../projects/services/project-access.service");
const ai_prompt_log_schema_1 = require("../schemas/ai-prompt-log.schema");
const meeting_summary_schema_1 = require("../schemas/meeting-summary.schema");
const ai_meeting_summary_access_service_1 = require("./ai-meeting-summary-access.service");
const ai_meeting_summary_data_builder_service_1 = require("./ai-meeting-summary-data-builder.service");
const ai_provider_service_1 = require("./ai-provider.service");
const prompt_builder_service_1 = require("./prompt-builder.service");
let AiMeetingSummaryService = class AiMeetingSummaryService {
    meetingSummaryModel;
    aiPromptLogModel;
    accessService;
    dataBuilderService;
    aiProviderService;
    meetingAccessService;
    meetingsRepository;
    projectAccessService;
    promptBuilderService;
    rateLimitWindowMs = 10 * 60 * 1000;
    rateLimitMax = 3;
    generateHits = new Map();
    constructor(meetingSummaryModel, aiPromptLogModel, accessService, dataBuilderService, aiProviderService, meetingAccessService, meetingsRepository, projectAccessService, promptBuilderService) {
        this.meetingSummaryModel = meetingSummaryModel;
        this.aiPromptLogModel = aiPromptLogModel;
        this.accessService = accessService;
        this.dataBuilderService = dataBuilderService;
        this.aiProviderService = aiProviderService;
        this.meetingAccessService = meetingAccessService;
        this.meetingsRepository = meetingsRepository;
        this.projectAccessService = projectAccessService;
        this.promptBuilderService = promptBuilderService;
    }
    async generateMeetingSummary(currentUserId, workspaceId, projectId, meetingId, dto = {}) {
        const summaryModel = this.getSummaryModel();
        await this.accessService.assertCanGenerateSummary(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        if (!dto.forceRegenerate) {
            const existingSummary = await this.findLatestSummary(workspaceId, projectId, meeting);
            if (existingSummary) {
                return {
                    success: true,
                    message: 'Get existing meeting summary successfully',
                    data: {
                        summary: this.toSummaryResponse(existingSummary),
                    },
                };
            }
        }
        this.assertGenerateRateLimit(workspaceId, projectId, meetingId);
        const inputData = await this.dataBuilderService.buildMeetingSummaryInput({
            workspaceId,
            projectId,
            meeting,
        });
        const prompt = this.promptBuilderService.buildMeetingSummaryPrompt(inputData);
        const startedAt = Date.now();
        try {
            const aiResult = await this.aiProviderService.generateMeetingSummary(prompt, inputData);
            const summary = await summaryModel.create({
                workspaceId,
                projectId,
                sprintId: meeting.sprintId ?? null,
                meetingId,
                transcriptId: inputData.transcript.id,
                title: aiResult.output.title,
                summary: aiResult.output.summary,
                keyPoints: aiResult.output.keyPoints,
                decisions: aiResult.output.decisions,
                actionItems: aiResult.output.actionItems,
                risks: aiResult.output.risks,
                openQuestions: aiResult.output.openQuestions,
                nextSteps: aiResult.output.nextSteps,
                aiOutput: aiResult.output,
                aiModel: aiResult.model,
                status: ai_report_status_enum_1.AiReportStatus.Completed,
                createdBy: currentUserId,
            });
            await this.meetingsRepository.updateSummaryId(meeting, this.getSummaryId(summary));
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
                message: 'Generate meeting summary successfully',
                data: {
                    summary: this.toSummaryResponse(summary),
                },
            };
        }
        catch (error) {
            await this.writePromptLog({
                workspaceId,
                projectId,
                userId: currentUserId,
                model: process.env.AI_MODEL ?? 'mock-meeting-summary',
                prompt,
                response: '',
                responseTimeMs: Date.now() - startedAt,
                success: false,
                errorMessage: error instanceof Error ? error.message : 'AI provider failed',
            });
            throw new common_1.ServiceUnavailableException('AI provider failed');
        }
    }
    async getMeetingSummary(currentUserId, workspaceId, projectId, meetingId) {
        this.getSummaryModel();
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        await this.accessService.assertCanViewSummary(currentUserId, workspaceId, meetingId);
        const summary = await this.findLatestSummary(workspaceId, projectId, meeting);
        if (!summary) {
            throw new common_1.NotFoundException('Meeting summary not found');
        }
        return {
            success: true,
            message: 'Get meeting summary successfully',
            data: {
                summary: this.toSummaryResponse(summary),
            },
        };
    }
    async getMeetingSummaries(currentUserId, workspaceId, projectId, meetingId, query) {
        const summaryModel = this.getSummaryModel();
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        await this.accessService.assertCanViewSummary(currentUserId, workspaceId, meetingId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const mongoQuery = {
            workspaceId,
            projectId,
            meetingId,
        };
        const [items, total] = await Promise.all([
            summaryModel
                .find(mongoQuery)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            summaryModel.countDocuments(mongoQuery).exec(),
        ]);
        return {
            success: true,
            message: 'Get meeting summaries successfully',
            data: {
                items: items.map((summary) => this.toSummaryResponse(summary)),
                meta: {
                    total,
                    page,
                    limit,
                },
            },
        };
    }
    async getMeetingSummaryDetail(currentUserId, workspaceId, projectId, summaryId) {
        const summaryModel = this.getSummaryModel();
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const summary = await summaryModel.findById(summaryId).exec();
        if (!summary ||
            summary.workspaceId !== workspaceId ||
            summary.projectId !== projectId) {
            throw new common_1.NotFoundException('Meeting summary not found in this project');
        }
        await this.meetingAccessService.assertMeetingInProject(summary.meetingId, projectId);
        await this.accessService.assertCanViewSummary(currentUserId, workspaceId, summary.meetingId);
        return {
            success: true,
            message: 'Get meeting summary detail successfully',
            data: {
                summary: this.toSummaryResponse(summary),
            },
        };
    }
    async findLatestSummary(workspaceId, projectId, meeting) {
        const summaryModel = this.getSummaryModel();
        if (meeting.mongoSummaryId) {
            const summary = await summaryModel
                .findById(meeting.mongoSummaryId)
                .exec();
            if (summary &&
                summary.workspaceId === workspaceId &&
                summary.projectId === projectId &&
                summary.meetingId === meeting.id) {
                return summary;
            }
        }
        return summaryModel
            .findOne({
            workspaceId,
            projectId,
            meetingId: meeting.id,
        })
            .sort({ createdAt: -1 })
            .exec();
    }
    assertGenerateRateLimit(workspaceId, projectId, meetingId) {
        const key = `${workspaceId}:${projectId}:${meetingId}`;
        const now = Date.now();
        const validHits = (this.generateHits.get(key) ?? []).filter((hit) => now - hit < this.rateLimitWindowMs);
        if (validHits.length >= this.rateLimitMax) {
            throw new common_1.HttpException('Too many AI meeting summary requests for this meeting', common_1.HttpStatus.TOO_MANY_REQUESTS);
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
            feature: ai_report_type_enum_1.AiReportType.MeetingSummary,
            aiModel: payload.model,
            prompt: payload.prompt,
            response: payload.response,
            responseTimeMs: payload.responseTimeMs,
            success: payload.success,
            errorMessage: payload.errorMessage ?? null,
        });
    }
    getSummaryModel() {
        if (!this.meetingSummaryModel) {
            throw new common_1.ServiceUnavailableException('MongoDB is disabled');
        }
        return this.meetingSummaryModel;
    }
    getSummaryId(summary) {
        return summary._id.toString();
    }
    toSummaryResponse(summary) {
        const stampedSummary = summary;
        return {
            id: this.getSummaryId(summary),
            workspaceId: summary.workspaceId,
            projectId: summary.projectId,
            sprintId: summary.sprintId ?? null,
            meetingId: summary.meetingId,
            transcriptId: summary.transcriptId,
            title: summary.title,
            summary: summary.summary,
            keyPoints: summary.keyPoints ?? [],
            decisions: summary.decisions ?? [],
            actionItems: summary.actionItems ?? [],
            risks: summary.risks ?? [],
            openQuestions: summary.openQuestions ?? [],
            nextSteps: summary.nextSteps ?? [],
            aiOutput: summary.aiOutput,
            model: summary.aiModel ?? null,
            status: summary.status,
            createdBy: summary.createdBy,
            createdAt: stampedSummary.createdAt,
            updatedAt: stampedSummary.updatedAt,
        };
    }
};
exports.AiMeetingSummaryService = AiMeetingSummaryService;
exports.AiMeetingSummaryService = AiMeetingSummaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(meeting_summary_schema_1.MeetingSummary.name)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, mongoose_1.InjectModel)(ai_prompt_log_schema_1.AiPromptLog.name)),
    __metadata("design:paramtypes", [Object, Object, ai_meeting_summary_access_service_1.AiMeetingSummaryAccessService,
        ai_meeting_summary_data_builder_service_1.AiMeetingSummaryDataBuilderService,
        ai_provider_service_1.AiProviderService,
        meeting_access_service_1.MeetingAccessService,
        meetings_repository_1.MeetingsRepository,
        project_access_service_1.ProjectAccessService,
        prompt_builder_service_1.PromptBuilderService])
], AiMeetingSummaryService);
//# sourceMappingURL=ai-meeting-summary.service.js.map