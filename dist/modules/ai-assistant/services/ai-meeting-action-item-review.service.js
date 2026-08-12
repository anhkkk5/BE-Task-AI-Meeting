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
exports.AiMeetingActionItemReviewService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const meeting_action_item_review_status_enum_1 = require("../../../common/enums/meeting-action-item-review-status.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const meeting_access_service_1 = require("../../meetings/services/meeting-access.service");
const meeting_transcript_schema_1 = require("../../meetings/schemas/meeting-transcript.schema");
const project_access_service_1 = require("../../projects/services/project-access.service");
const tasks_service_1 = require("../../tasks/services/tasks.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const meeting_action_item_reviews_repository_1 = require("../repositories/meeting-action-item-reviews.repository");
const meeting_summary_schema_1 = require("../schemas/meeting-summary.schema");
const ai_meeting_summary_access_service_1 = require("./ai-meeting-summary-access.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let AiMeetingActionItemReviewService = class AiMeetingActionItemReviewService {
    meetingSummaryModel;
    reviewsRepository;
    summaryAccessService;
    projectAccessService;
    meetingAccessService;
    tasksService;
    tasksRepository;
    meetingTranscriptModel;
    constructor(meetingSummaryModel, reviewsRepository, summaryAccessService, projectAccessService, meetingAccessService, tasksService, tasksRepository, meetingTranscriptModel) {
        this.meetingSummaryModel = meetingSummaryModel;
        this.reviewsRepository = reviewsRepository;
        this.summaryAccessService = summaryAccessService;
        this.projectAccessService = projectAccessService;
        this.meetingAccessService = meetingAccessService;
        this.tasksService = tasksService;
        this.tasksRepository = tasksRepository;
        this.meetingTranscriptModel = meetingTranscriptModel;
    }
    async getActionItems(currentUserId, workspaceId, projectId, summaryId) {
        const { summary, role } = await this.getSummaryContext(currentUserId, workspaceId, projectId, summaryId, false);
        const reviews = await this.reviewsRepository.findBySummary(summaryId);
        const reviewsByIndex = new Map(reviews.map((review) => [review.actionItemIndex, review]));
        return {
            success: true,
            message: 'Lấy danh sách việc cần làm thành công',
            data: {
                canReview: managerRoles.some((managerRole) => managerRole === role),
                items: await Promise.all((summary.actionItems ?? []).map(async (item, index) => this.toActionItemResponse(index, item, reviewsByIndex.get(index), await this.findDuplicates(projectId, item.text), await this.findCitation(summary.meetingId, item.text)))),
            },
        };
    }
    async approveActionItem(currentUserId, workspaceId, projectId, summaryId, actionItemIndex, dto) {
        const { summary } = await this.getSummaryContext(currentUserId, workspaceId, projectId, summaryId, true);
        const item = this.getActionItem(summary, actionItemIndex);
        const existing = await this.reviewsRepository.findOne(summaryId, actionItemIndex);
        this.assertPending(existing);
        const duplicateCandidates = await this.findDuplicates(projectId, dto.title?.trim() || item.text);
        if (duplicateCandidates.length && !dto.allowDuplicate) {
            throw new common_1.ConflictException({
                message: 'Phát hiện task tương tự. Hãy kiểm tra trước khi xác nhận tạo trùng.',
                duplicateCandidates,
                allowDuplicateRequired: true,
            });
        }
        const pendingReview = existing ??
            (await this.reviewsRepository.save({
                workspaceId,
                projectId,
                meetingId: summary.meetingId,
                summaryId,
                actionItemIndex,
                actionItemText: item.text,
                suggestedAssigneeName: item.assigneeName ?? null,
                suggestedDueDate: this.normalizeDueDate(item.dueDate) ?? null,
                status: meeting_action_item_review_status_enum_1.MeetingActionItemReviewStatus.Pending,
                reviewedBy: null,
                reviewedAt: null,
                createdTaskId: null,
                rejectionReason: null,
            }));
        const taskResult = await this.tasksService.createTask(currentUserId, workspaceId, projectId, {
            title: dto.title?.trim() || this.buildTaskTitle(item.text),
            description: dto.description?.trim() || this.buildTaskDescription(item),
            assigneeId: dto.assigneeId,
            sprintId: dto.sprintId,
            dueDate: dto.dueDate ?? this.normalizeDueDate(item.dueDate),
            priority: dto.priority,
        });
        const task = taskResult.data.task;
        const review = await this.reviewsRepository.save({
            ...pendingReview,
            workspaceId,
            projectId,
            meetingId: summary.meetingId,
            summaryId,
            actionItemIndex,
            actionItemText: item.text,
            suggestedAssigneeName: item.assigneeName ?? null,
            suggestedDueDate: this.normalizeDueDate(item.dueDate) ?? null,
            status: meeting_action_item_review_status_enum_1.MeetingActionItemReviewStatus.TaskCreated,
            reviewedBy: currentUserId,
            reviewedAt: new Date(),
            createdTaskId: task.id,
            rejectionReason: null,
        });
        return {
            success: true,
            message: 'Đã duyệt và tạo task thành công',
            data: {
                actionItem: this.toActionItemResponse(actionItemIndex, item, review, [], await this.findCitation(summary.meetingId, item.text)),
                task,
            },
        };
    }
    async rejectActionItem(currentUserId, workspaceId, projectId, summaryId, actionItemIndex, dto) {
        const { summary } = await this.getSummaryContext(currentUserId, workspaceId, projectId, summaryId, true);
        const item = this.getActionItem(summary, actionItemIndex);
        const existing = await this.reviewsRepository.findOne(summaryId, actionItemIndex);
        this.assertPending(existing);
        const review = await this.reviewsRepository.save({
            ...existing,
            workspaceId,
            projectId,
            meetingId: summary.meetingId,
            summaryId,
            actionItemIndex,
            actionItemText: item.text,
            suggestedAssigneeName: item.assigneeName ?? null,
            suggestedDueDate: this.normalizeDueDate(item.dueDate) ?? null,
            status: meeting_action_item_review_status_enum_1.MeetingActionItemReviewStatus.Rejected,
            reviewedBy: currentUserId,
            reviewedAt: new Date(),
            createdTaskId: null,
            rejectionReason: dto.reason?.trim() || null,
        });
        return {
            success: true,
            message: 'Đã từ chối việc cần làm',
            data: {
                actionItem: this.toActionItemResponse(actionItemIndex, item, review),
            },
        };
    }
    async getSummaryContext(currentUserId, workspaceId, projectId, summaryId, requireManager) {
        const summaryModel = this.getSummaryModel();
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const summary = await summaryModel.findById(summaryId).exec();
        if (!summary ||
            summary.workspaceId !== workspaceId ||
            summary.projectId !== projectId) {
            throw new common_1.NotFoundException('Không tìm thấy bản tóm tắt trong dự án');
        }
        await this.meetingAccessService.assertMeetingInProject(summary.meetingId, projectId);
        const role = requireManager
            ? await this.summaryAccessService.assertCanGenerateSummary(currentUserId, workspaceId)
            : await this.summaryAccessService.assertCanViewSummary(currentUserId, workspaceId, summary.meetingId);
        return { summary, role };
    }
    getActionItem(summary, actionItemIndex) {
        if (!Number.isInteger(actionItemIndex) || actionItemIndex < 0) {
            throw new common_1.BadRequestException('Vị trí việc cần làm không hợp lệ');
        }
        const item = summary.actionItems?.[actionItemIndex];
        if (!item) {
            throw new common_1.NotFoundException('Không tìm thấy việc cần làm');
        }
        return item;
    }
    assertPending(review) {
        if (!review)
            return;
        if (review.status === meeting_action_item_review_status_enum_1.MeetingActionItemReviewStatus.TaskCreated) {
            throw new common_1.ConflictException('Việc cần làm này đã được tạo thành task');
        }
        if (review.status === meeting_action_item_review_status_enum_1.MeetingActionItemReviewStatus.Rejected) {
            throw new common_1.ConflictException('Việc cần làm này đã bị từ chối');
        }
    }
    buildTaskTitle(text) {
        const title = text.trim().slice(0, 200);
        if (title.length < 2) {
            throw new common_1.BadRequestException('Nội dung việc cần làm quá ngắn');
        }
        return title;
    }
    buildTaskDescription(item) {
        const details = ['Được tạo từ việc cần làm trong tóm tắt cuộc họp.'];
        if (item.assigneeName) {
            details.push(`Người được AI đề xuất: ${item.assigneeName}.`);
        }
        details.push('', item.text.trim());
        return details.join('\n').slice(0, 2000);
    }
    normalizeDueDate(value) {
        if (!value)
            return undefined;
        const match = value.trim().match(/^\d{4}-\d{2}-\d{2}/);
        return match?.[0];
    }
    toActionItemResponse(index, item, review, duplicateCandidates = [], citation = null) {
        return {
            index,
            text: item.text,
            assigneeName: item.assigneeName ?? null,
            assigneeUserId: item.assigneeUserId ?? null,
            dueDate: item.dueDate ?? null,
            aiStatus: item.status ?? null,
            source: item.source ?? null,
            reviewStatus: review?.status ?? meeting_action_item_review_status_enum_1.MeetingActionItemReviewStatus.Pending,
            createdTaskId: review?.createdTaskId ?? null,
            rejectionReason: review?.rejectionReason ?? null,
            reviewedAt: review?.reviewedAt ?? null,
            duplicateCandidates,
            confidence: citation?.confidence ?? null,
            citation: citation ? { ...citation, startedAt: citation.startedAt.toISOString(), endedAt: citation.endedAt?.toISOString() ?? null } : null,
        };
    }
    async findDuplicates(projectId, title) {
        if (!this.tasksRepository)
            return [];
        const candidates = await this.tasksRepository.findDuplicateCandidates(projectId, title);
        const normalized = this.normalizeText(title);
        return candidates.map((task) => {
            const candidate = this.normalizeText(task.title);
            const sourceTokens = new Set(normalized.split(' ').filter(Boolean));
            const candidateTokens = new Set(candidate.split(' ').filter(Boolean));
            const overlap = [...sourceTokens].filter((token) => candidateTokens.has(token)).length;
            const similarity = Math.round((overlap / Math.max(1, Math.min(sourceTokens.size, candidateTokens.size))) * 100);
            return { id: task.id, taskCode: task.taskCode, title: task.title, status: task.status, similarity };
        }).filter((item) => item.similarity >= 50).sort((a, b) => b.similarity - a.similarity);
    }
    normalizeText(value) {
        return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    }
    async findCitation(meetingId, actionText) {
        if (!this.meetingTranscriptModel)
            return null;
        const transcript = await this.meetingTranscriptModel.findOne({ meetingId }).lean().exec();
        const actionTokens = new Set(this.normalizeText(actionText).split(' ').filter((token) => token.length >= 4));
        const ranked = (transcript?.liveSegments ?? []).map((segment) => {
            const segmentTokens = new Set(this.normalizeText(segment.text).split(' ').filter((token) => token.length >= 4));
            const overlap = [...actionTokens].filter((token) => segmentTokens.has(token)).length;
            return { segment, score: overlap / Math.max(1, actionTokens.size) };
        }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
        const best = ranked[0]?.segment;
        return best ? { segmentId: best.chunkId ?? null, speakerName: best.speakerName ?? null, text: best.text, startedAt: new Date(best.startedAt), endedAt: best.endedAt ? new Date(best.endedAt) : null, confidence: best.confidence ?? null } : null;
    }
    getSummaryModel() {
        if (!this.meetingSummaryModel) {
            throw new common_1.ServiceUnavailableException('MongoDB đang tắt');
        }
        return this.meetingSummaryModel;
    }
};
exports.AiMeetingActionItemReviewService = AiMeetingActionItemReviewService;
exports.AiMeetingActionItemReviewService = AiMeetingActionItemReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, mongoose_1.InjectModel)(meeting_summary_schema_1.MeetingSummary.name)),
    __param(6, (0, common_1.Optional)()),
    __param(7, (0, common_1.Optional)()),
    __param(7, (0, mongoose_1.InjectModel)(meeting_transcript_schema_1.MeetingTranscript.name)),
    __metadata("design:paramtypes", [Object, meeting_action_item_reviews_repository_1.MeetingActionItemReviewsRepository,
        ai_meeting_summary_access_service_1.AiMeetingSummaryAccessService,
        project_access_service_1.ProjectAccessService,
        meeting_access_service_1.MeetingAccessService,
        tasks_service_1.TasksService,
        tasks_repository_1.TasksRepository, Object])
], AiMeetingActionItemReviewService);
//# sourceMappingURL=ai-meeting-action-item-review.service.js.map