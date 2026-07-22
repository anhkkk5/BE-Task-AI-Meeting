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
exports.AiPersonalizedMeetingSummaryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ai_report_status_enum_1 = require("../../../common/enums/ai-report-status.enum");
const ai_report_type_enum_1 = require("../../../common/enums/ai-report-type.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const meeting_participants_repository_1 = require("../../meetings/repositories/meeting-participants.repository");
const meeting_access_service_1 = require("../../meetings/services/meeting-access.service");
const project_access_service_1 = require("../../projects/services/project-access.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const ai_prompt_log_schema_1 = require("../schemas/ai-prompt-log.schema");
const meeting_summary_schema_1 = require("../schemas/meeting-summary.schema");
const personalized_meeting_summary_schema_1 = require("../schemas/personalized-meeting-summary.schema");
const ai_personalized_meeting_summary_access_service_1 = require("./ai-personalized-meeting-summary-access.service");
const ai_personalized_meeting_summary_data_builder_service_1 = require("./ai-personalized-meeting-summary-data-builder.service");
const ai_provider_service_1 = require("./ai-provider.service");
const prompt_builder_service_1 = require("./prompt-builder.service");
let AiPersonalizedMeetingSummaryService = class AiPersonalizedMeetingSummaryService {
    personalizedSummaryModel;
    meetingSummaryModel;
    aiPromptLogModel;
    accessService;
    dataBuilderService;
    aiProviderService;
    meetingAccessService;
    meetingParticipantsRepository;
    projectAccessService;
    promptBuilderService;
    workspaceAccessService;
    rateLimitWindowMs = 10 * 60 * 1000;
    rateLimitMax = 5;
    generateHits = new Map();
    constructor(personalizedSummaryModel, meetingSummaryModel, aiPromptLogModel, accessService, dataBuilderService, aiProviderService, meetingAccessService, meetingParticipantsRepository, projectAccessService, promptBuilderService, workspaceAccessService) {
        this.personalizedSummaryModel = personalizedSummaryModel;
        this.meetingSummaryModel = meetingSummaryModel;
        this.aiPromptLogModel = aiPromptLogModel;
        this.accessService = accessService;
        this.dataBuilderService = dataBuilderService;
        this.aiProviderService = aiProviderService;
        this.meetingAccessService = meetingAccessService;
        this.meetingParticipantsRepository = meetingParticipantsRepository;
        this.projectAccessService = projectAccessService;
        this.promptBuilderService = promptBuilderService;
        this.workspaceAccessService = workspaceAccessService;
    }
    async generateMyPersonalizedMeetingSummary(currentUserId, workspaceId, projectId, meetingId, dto = {}) {
        this.getPersonalizedSummaryModel();
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        await this.accessService.assertCanUseOwnSummary(currentUserId, workspaceId, meetingId);
        const summary = await this.generateForTargetUser({
            currentUserId,
            workspaceId,
            projectId,
            meeting,
            targetUserId: currentUserId,
            forceRegenerate: Boolean(dto.forceRegenerate),
        });
        return {
            success: true,
            message: 'Generate my personalized meeting summary successfully',
            data: {
                summary: this.toSummaryResponse(summary),
            },
        };
    }
    async generateMemberPersonalizedMeetingSummary(currentUserId, workspaceId, projectId, meetingId, memberId, dto = {}) {
        this.getPersonalizedSummaryModel();
        await this.accessService.assertCanManageMemberSummary(currentUserId, workspaceId);
        await this.workspaceAccessService.assertWorkspaceMember(memberId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        await this.accessService.assertTargetParticipant(meetingId, memberId);
        const summary = await this.generateForTargetUser({
            currentUserId,
            workspaceId,
            projectId,
            meeting,
            targetUserId: memberId,
            forceRegenerate: Boolean(dto.forceRegenerate),
        });
        return {
            success: true,
            message: 'Generate member personalized meeting summary successfully',
            data: {
                summary: this.toSummaryResponse(summary),
            },
        };
    }
    async generateAllPersonalizedMeetingSummaries(currentUserId, workspaceId, projectId, meetingId, dto = {}) {
        this.getPersonalizedSummaryModel();
        await this.accessService.assertCanManageMemberSummary(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        const participants = await this.meetingParticipantsRepository.findByMeeting(meetingId);
        const summaries = [];
        for (const participant of participants) {
            const summary = await this.generateForTargetUser({
                currentUserId,
                workspaceId,
                projectId,
                meeting,
                targetUserId: participant.userId,
                forceRegenerate: Boolean(dto.forceRegenerate),
            });
            summaries.push(summary);
        }
        return {
            success: true,
            message: 'Generate personalized meeting summaries successfully',
            data: {
                items: summaries.map((summary) => this.toSummaryResponse(summary)),
            },
        };
    }
    async getMyPersonalizedMeetingSummary(currentUserId, workspaceId, projectId, meetingId) {
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        await this.accessService.assertCanUseOwnSummary(currentUserId, workspaceId, meetingId);
        const summary = await this.findLatestPersonalizedSummary({
            workspaceId,
            projectId,
            meetingId,
            userId: currentUserId,
        });
        if (!summary) {
            throw new common_1.NotFoundException('Personalized meeting summary not found');
        }
        return {
            success: true,
            message: 'Get my personalized meeting summary successfully',
            data: {
                summary: this.toSummaryResponse(summary),
            },
        };
    }
    async getMemberPersonalizedMeetingSummary(currentUserId, workspaceId, projectId, meetingId, memberId) {
        await this.accessService.assertCanManageMemberSummary(currentUserId, workspaceId);
        await this.workspaceAccessService.assertWorkspaceMember(memberId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        await this.accessService.assertTargetParticipant(meetingId, memberId);
        const summary = await this.findLatestPersonalizedSummary({
            workspaceId,
            projectId,
            meetingId,
            userId: memberId,
        });
        if (!summary) {
            throw new common_1.NotFoundException('Personalized meeting summary not found');
        }
        return {
            success: true,
            message: 'Get member personalized meeting summary successfully',
            data: {
                summary: this.toSummaryResponse(summary),
            },
        };
    }
    async getPersonalizedMeetingSummaryDetail(currentUserId, workspaceId, projectId, summaryId) {
        const summaryModel = this.getPersonalizedSummaryModel();
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const summary = await summaryModel.findById(summaryId).exec();
        if (!summary ||
            summary.workspaceId !== workspaceId ||
            summary.projectId !== projectId) {
            throw new common_1.NotFoundException('Personalized meeting summary not found in this project');
        }
        await this.meetingAccessService.assertMeetingInProject(summary.meetingId, projectId);
        await this.accessService.assertCanViewSummary(currentUserId, workspaceId, summary);
        return {
            success: true,
            message: 'Get personalized meeting summary detail successfully',
            data: {
                summary: this.toSummaryResponse(summary),
            },
        };
    }
    async getMyMeetingActionItems(currentUserId, workspaceId, projectId, query) {
        const summaryModel = this.getPersonalizedSummaryModel();
        const role = await this.workspaceAccessService.getUserWorkspaceRole(currentUserId, workspaceId);
        if (!role || role === workspace_role_enum_1.WorkspaceRole.Viewer) {
            throw new common_1.HttpException('You can not view meeting action items', common_1.HttpStatus.FORBIDDEN);
        }
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        this.assertValidActionItemQuery(query);
        const mongoQuery = {
            workspaceId,
            projectId,
            userId: currentUserId,
        };
        if (query.meetingId) {
            mongoQuery.meetingId = query.meetingId;
        }
        if (query.sprintId) {
            mongoQuery.sprintId = query.sprintId;
        }
        const summaries = await summaryModel
            .find(mongoQuery)
            .sort({ createdAt: -1 })
            .limit(500)
            .exec();
        const filteredSummaries = summaries.filter((summary) => this.matchesMeetingDateFilter(summary, query));
        const actionItems = filteredSummaries.flatMap((summary) => (summary.aiOutput?.myActionItems ?? []).map((item) => this.toActionItemResponse(summary, item)));
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const startIndex = (page - 1) * limit;
        return {
            success: true,
            message: 'Get my meeting action items successfully',
            data: {
                items: actionItems.slice(startIndex, startIndex + limit),
                meta: {
                    total: actionItems.length,
                    page,
                    limit,
                },
            },
        };
    }
    async generateForTargetUser(params) {
        const summaryModel = this.getPersonalizedSummaryModel();
        const sourceSummary = await this.findLatestMeetingSummary(params.workspaceId, params.projectId, params.meeting);
        if (!sourceSummary) {
            throw new common_1.NotFoundException('Meeting summary not found');
        }
        if (!params.forceRegenerate) {
            const existingSummary = await summaryModel
                .findOne({
                workspaceId: params.workspaceId,
                projectId: params.projectId,
                meetingId: params.meeting.id,
                userId: params.targetUserId,
                sourceSummaryId: sourceSummary._id.toString(),
            })
                .sort({ createdAt: -1 })
                .exec();
            if (existingSummary) {
                return existingSummary;
            }
        }
        this.assertGenerateRateLimit(params.workspaceId, params.projectId, params.meeting.id, params.targetUserId);
        const inputData = await this.dataBuilderService.buildPersonalizedMeetingSummaryInput({
            workspaceId: params.workspaceId,
            projectId: params.projectId,
            meeting: params.meeting,
            sourceSummary,
            targetUserId: params.targetUserId,
        });
        const prompt = this.promptBuilderService.buildPersonalizedMeetingSummaryPrompt(inputData);
        const startedAt = Date.now();
        try {
            const aiResult = await this.aiProviderService.generatePersonalizedMeetingSummary(prompt, inputData);
            const summary = await summaryModel.create({
                workspaceId: params.workspaceId,
                projectId: params.projectId,
                sprintId: params.meeting.sprintId ?? null,
                meetingId: params.meeting.id,
                userId: params.targetUserId,
                sourceSummaryId: sourceSummary._id.toString(),
                transcriptId: inputData.transcriptId,
                inputData,
                aiOutput: aiResult.output,
                aiModel: aiResult.model,
                status: ai_report_status_enum_1.AiReportStatus.Completed,
                createdBy: params.currentUserId,
            });
            await this.writePromptLog({
                workspaceId: params.workspaceId,
                projectId: params.projectId,
                userId: params.currentUserId,
                model: aiResult.model,
                prompt,
                response: aiResult.rawResponse,
                responseTimeMs: Date.now() - startedAt,
                success: true,
            });
            return summary;
        }
        catch (error) {
            await this.writePromptLog({
                workspaceId: params.workspaceId,
                projectId: params.projectId,
                userId: params.currentUserId,
                model: process.env.AI_MODEL ?? 'mock-personalized-meeting-summary',
                prompt,
                response: '',
                responseTimeMs: Date.now() - startedAt,
                success: false,
                errorMessage: error instanceof Error ? error.message : 'AI provider failed',
            });
            throw new common_1.ServiceUnavailableException('AI provider failed');
        }
    }
    async findLatestMeetingSummary(workspaceId, projectId, meeting) {
        const summaryModel = this.getMeetingSummaryModel();
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
    async findLatestPersonalizedSummary(query) {
        return this.getPersonalizedSummaryModel()
            .findOne(query)
            .sort({ createdAt: -1 })
            .exec();
    }
    assertGenerateRateLimit(workspaceId, projectId, meetingId, targetUserId) {
        const key = `${workspaceId}:${projectId}:${meetingId}:${targetUserId}`;
        const now = Date.now();
        const validHits = (this.generateHits.get(key) ?? []).filter((hit) => now - hit < this.rateLimitWindowMs);
        if (validHits.length >= this.rateLimitMax) {
            throw new common_1.HttpException('Too many AI personalized meeting summary requests for this user', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        validHits.push(now);
        this.generateHits.set(key, validHits);
    }
    assertValidActionItemQuery(query) {
        if (query.fromDate && query.toDate) {
            const fromDate = this.normalizeDate(query.fromDate);
            const toDate = this.normalizeDate(query.toDate);
            if (fromDate > toDate) {
                throw new common_1.BadRequestException('fromDate must be before or equal to toDate');
            }
        }
    }
    matchesMeetingDateFilter(summary, query) {
        const meetingDate = this.extractMeetingDate(summary);
        if (!meetingDate) {
            return true;
        }
        if (query.fromDate && meetingDate < this.normalizeDate(query.fromDate)) {
            return false;
        }
        if (query.toDate && meetingDate > this.normalizeDate(query.toDate)) {
            return false;
        }
        return true;
    }
    extractMeetingDate(summary) {
        const inputData = summary.inputData;
        return inputData.meeting?.meetingDate?.slice(0, 10) ?? null;
    }
    toActionItemResponse(summary, actionItem) {
        const inputData = summary.inputData;
        return {
            meetingId: summary.meetingId,
            meetingTitle: inputData.meeting?.title ?? null,
            meetingDate: inputData.meeting?.meetingDate ?? null,
            summaryId: this.getSummaryId(summary),
            title: actionItem.title,
            assigneeId: actionItem.assigneeId ?? null,
            assigneeName: actionItem.assigneeName ?? null,
            deadline: actionItem.deadline ?? null,
            source: actionItem.source ?? null,
        };
    }
    async writePromptLog(payload) {
        if (!this.aiPromptLogModel) {
            return;
        }
        await this.aiPromptLogModel.create({
            workspaceId: payload.workspaceId,
            projectId: payload.projectId,
            userId: payload.userId,
            feature: ai_report_type_enum_1.AiReportType.PersonalizedMeetingSummary,
            aiModel: payload.model,
            prompt: payload.prompt,
            response: payload.response,
            responseTimeMs: payload.responseTimeMs,
            success: payload.success,
            errorMessage: payload.errorMessage ?? null,
        });
    }
    getPersonalizedSummaryModel() {
        if (!this.personalizedSummaryModel) {
            throw new common_1.ServiceUnavailableException('MongoDB is disabled');
        }
        return this.personalizedSummaryModel;
    }
    getMeetingSummaryModel() {
        if (!this.meetingSummaryModel) {
            throw new common_1.ServiceUnavailableException('MongoDB is disabled');
        }
        return this.meetingSummaryModel;
    }
    getSummaryId(summary) {
        return summary._id.toString();
    }
    normalizeDate(value) {
        return value.slice(0, 10);
    }
    toSummaryResponse(summary) {
        const stampedSummary = summary;
        return {
            id: this.getSummaryId(summary),
            workspaceId: summary.workspaceId,
            projectId: summary.projectId,
            sprintId: summary.sprintId ?? null,
            meetingId: summary.meetingId,
            userId: summary.userId,
            sourceSummaryId: summary.sourceSummaryId,
            transcriptId: summary.transcriptId ?? null,
            aiOutput: summary.aiOutput,
            personalSummary: summary.aiOutput?.personalSummary ?? null,
            model: summary.aiModel ?? null,
            status: summary.status,
            createdBy: summary.createdBy,
            createdAt: stampedSummary.createdAt,
            updatedAt: stampedSummary.updatedAt,
        };
    }
};
exports.AiPersonalizedMeetingSummaryService = AiPersonalizedMeetingSummaryService;
exports.AiPersonalizedMeetingSummaryService = AiPersonalizedMeetingSummaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(personalized_meeting_summary_schema_1.PersonalizedMeetingSummary.name)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, mongoose_1.InjectModel)(meeting_summary_schema_1.MeetingSummary.name)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, mongoose_1.InjectModel)(ai_prompt_log_schema_1.AiPromptLog.name)),
    __metadata("design:paramtypes", [Object, Object, Object, ai_personalized_meeting_summary_access_service_1.AiPersonalizedMeetingSummaryAccessService,
        ai_personalized_meeting_summary_data_builder_service_1.AiPersonalizedMeetingSummaryDataBuilderService,
        ai_provider_service_1.AiProviderService,
        meeting_access_service_1.MeetingAccessService,
        meeting_participants_repository_1.MeetingParticipantsRepository,
        project_access_service_1.ProjectAccessService,
        prompt_builder_service_1.PromptBuilderService,
        workspace_access_service_1.WorkspaceAccessService])
], AiPersonalizedMeetingSummaryService);
//# sourceMappingURL=ai-personalized-meeting-summary.service.js.map