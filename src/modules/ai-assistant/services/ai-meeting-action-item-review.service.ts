import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeetingActionItemReviewStatus } from '../../../common/enums/meeting-action-item-review-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { MeetingTranscript, MeetingTranscriptDocument } from '../../meetings/schemas/meeting-transcript.schema';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksService } from '../../tasks/services/tasks.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { ApproveMeetingActionItemDto } from '../dto/approve-meeting-action-item.dto';
import { RejectMeetingActionItemDto } from '../dto/reject-meeting-action-item.dto';
import { MeetingActionItemReview } from '../entities/meeting-action-item-review.entity';
import { MeetingActionItemReviewsRepository } from '../repositories/meeting-action-item-reviews.repository';
import {
  MeetingSummary,
  MeetingSummaryActionItem,
  MeetingSummaryDocument,
} from '../schemas/meeting-summary.schema';
import { AiMeetingSummaryAccessService } from './ai-meeting-summary-access.service';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class AiMeetingActionItemReviewService {
  constructor(
    @Optional()
    @InjectModel(MeetingSummary.name)
    private readonly meetingSummaryModel: Model<MeetingSummaryDocument> | null,
    private readonly reviewsRepository: MeetingActionItemReviewsRepository,
    private readonly summaryAccessService: AiMeetingSummaryAccessService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly meetingAccessService: MeetingAccessService,
    private readonly tasksService: TasksService,
    @Optional() private readonly tasksRepository?: TasksRepository,
    @Optional() @InjectModel(MeetingTranscript.name)
    private readonly meetingTranscriptModel?: Model<MeetingTranscriptDocument> | null,
  ) {}

  async getActionItems(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    summaryId: string,
  ) {
    const { summary, role } = await this.getSummaryContext(
      currentUserId,
      workspaceId,
      projectId,
      summaryId,
      false,
    );
    const reviews = await this.reviewsRepository.findBySummary(summaryId);
    const reviewsByIndex = new Map(
      reviews.map((review) => [review.actionItemIndex, review]),
    );

    return {
      success: true,
      message: 'Lấy danh sách việc cần làm thành công',
      data: {
        canReview: managerRoles.some((managerRole) => managerRole === role),
        items: await Promise.all((summary.actionItems ?? []).map(async (item, index) =>
          this.toActionItemResponse(index, item, reviewsByIndex.get(index), await this.findDuplicates(projectId, item.text), await this.findCitation(summary.meetingId, item.text)),
        )),
      },
    };
  }

  async approveActionItem(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    summaryId: string,
    actionItemIndex: number,
    dto: ApproveMeetingActionItemDto,
  ) {
    const { summary } = await this.getSummaryContext(
      currentUserId,
      workspaceId,
      projectId,
      summaryId,
      true,
    );
    const item = this.getActionItem(summary, actionItemIndex);
    const existing = await this.reviewsRepository.findOne(
      summaryId,
      actionItemIndex,
    );
    this.assertPending(existing);
    const duplicateCandidates = await this.findDuplicates(projectId, dto.title?.trim() || item.text);
    if (duplicateCandidates.length && !dto.allowDuplicate) {
      throw new ConflictException({
        message: 'Phát hiện task tương tự. Hãy kiểm tra trước khi xác nhận tạo trùng.',
        duplicateCandidates,
        allowDuplicateRequired: true,
      });
    }

    const pendingReview =
      existing ??
      (await this.reviewsRepository.save({
        workspaceId,
        projectId,
        meetingId: summary.meetingId,
        summaryId,
        actionItemIndex,
        actionItemText: item.text,
        suggestedAssigneeName: item.assigneeName ?? null,
        suggestedDueDate: this.normalizeDueDate(item.dueDate) ?? null,
        status: MeetingActionItemReviewStatus.Pending,
        reviewedBy: null,
        reviewedAt: null,
        createdTaskId: null,
        rejectionReason: null,
      }));

    const taskResult = await this.tasksService.createTask(
      currentUserId,
      workspaceId,
      projectId,
      {
        title: dto.title?.trim() || this.buildTaskTitle(item.text),
        description: dto.description?.trim() || this.buildTaskDescription(item),
        assigneeId: dto.assigneeId,
        sprintId: dto.sprintId,
        dueDate: dto.dueDate ?? this.normalizeDueDate(item.dueDate),
        priority: dto.priority,
      },
    );
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
      status: MeetingActionItemReviewStatus.TaskCreated,
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

  async rejectActionItem(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    summaryId: string,
    actionItemIndex: number,
    dto: RejectMeetingActionItemDto,
  ) {
    const { summary } = await this.getSummaryContext(
      currentUserId,
      workspaceId,
      projectId,
      summaryId,
      true,
    );
    const item = this.getActionItem(summary, actionItemIndex);
    const existing = await this.reviewsRepository.findOne(
      summaryId,
      actionItemIndex,
    );
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
      status: MeetingActionItemReviewStatus.Rejected,
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

  private async getSummaryContext(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    summaryId: string,
    requireManager: boolean,
  ) {
    const summaryModel = this.getSummaryModel();
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const summary = await summaryModel.findById(summaryId).exec();

    if (
      !summary ||
      summary.workspaceId !== workspaceId ||
      summary.projectId !== projectId
    ) {
      throw new NotFoundException('Không tìm thấy bản tóm tắt trong dự án');
    }

    await this.meetingAccessService.assertMeetingInProject(
      summary.meetingId,
      projectId,
    );
    const role = requireManager
      ? await this.summaryAccessService.assertCanGenerateSummary(
          currentUserId,
          workspaceId,
        )
      : await this.summaryAccessService.assertCanViewSummary(
          currentUserId,
          workspaceId,
          summary.meetingId,
        );

    return { summary, role };
  }

  private getActionItem(
    summary: MeetingSummaryDocument,
    actionItemIndex: number,
  ) {
    if (!Number.isInteger(actionItemIndex) || actionItemIndex < 0) {
      throw new BadRequestException('Vị trí việc cần làm không hợp lệ');
    }

    const item = summary.actionItems?.[actionItemIndex];

    if (!item) {
      throw new NotFoundException('Không tìm thấy việc cần làm');
    }

    return item;
  }

  private assertPending(review: MeetingActionItemReview | null) {
    if (!review) return;

    if (review.status === MeetingActionItemReviewStatus.TaskCreated) {
      throw new ConflictException('Việc cần làm này đã được tạo thành task');
    }

    if (review.status === MeetingActionItemReviewStatus.Rejected) {
      throw new ConflictException('Việc cần làm này đã bị từ chối');
    }
  }

  private buildTaskTitle(text: string) {
    const title = text.trim().slice(0, 200);

    if (title.length < 2) {
      throw new BadRequestException('Nội dung việc cần làm quá ngắn');
    }

    return title;
  }

  private buildTaskDescription(item: MeetingSummaryActionItem) {
    const details = ['Được tạo từ việc cần làm trong tóm tắt cuộc họp.'];

    if (item.assigneeName) {
      details.push(`Người được AI đề xuất: ${item.assigneeName}.`);
    }

    details.push('', item.text.trim());
    return details.join('\n').slice(0, 2000);
  }

  private normalizeDueDate(value?: string | null) {
    if (!value) return undefined;

    const match = value.trim().match(/^\d{4}-\d{2}-\d{2}/);
    return match?.[0];
  }

  private toActionItemResponse(
    index: number,
    item: MeetingSummaryActionItem,
    review?: MeetingActionItemReview,
    duplicateCandidates: Array<{ id: string; taskCode: string; title: string; status: string }> = [],
    citation: { speakerName: string | null; text: string; startedAt: Date; endedAt: Date | null; confidence: number | null } | null = null,
  ) {
    return {
      index,
      text: item.text,
      assigneeName: item.assigneeName ?? null,
      assigneeUserId: item.assigneeUserId ?? null,
      dueDate: item.dueDate ?? null,
      aiStatus: item.status ?? null,
      source: item.source ?? null,
      reviewStatus: review?.status ?? MeetingActionItemReviewStatus.Pending,
      createdTaskId: review?.createdTaskId ?? null,
      rejectionReason: review?.rejectionReason ?? null,
      reviewedAt: review?.reviewedAt ?? null,
      duplicateCandidates,
      confidence: citation?.confidence ?? null,
      citation: citation ? { ...citation, startedAt: citation.startedAt.toISOString(), endedAt: citation.endedAt?.toISOString() ?? null } : null,
    };
  }

  private async findDuplicates(projectId: string, title: string) {
    if (!this.tasksRepository) return [];
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

  private normalizeText(value: string) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  async findCitation(meetingId: string, actionText: string) {
    if (!this.meetingTranscriptModel) return null;
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

  private getSummaryModel() {
    if (!this.meetingSummaryModel) {
      throw new ServiceUnavailableException('MongoDB đang tắt');
    }

    return this.meetingSummaryModel;
  }
}
