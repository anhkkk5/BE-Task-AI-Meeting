import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AiUserPreferencesService } from '../../users/services/ai-user-preferences.service';
import { GeneratePersonalizedMeetingSummaryDto } from '../dto/generate-personalized-meeting-summary.dto';
import { GetMyMeetingActionItemsQueryDto } from '../dto/get-my-meeting-action-items-query.dto';
import {
  AiPromptLog,
  AiPromptLogDocument,
} from '../schemas/ai-prompt-log.schema';
import {
  MeetingSummary,
  MeetingSummaryDocument,
} from '../schemas/meeting-summary.schema';
import {
  PersonalizedMeetingActionItem,
  PersonalizedMeetingSummary,
  PersonalizedMeetingSummaryDocument,
} from '../schemas/personalized-meeting-summary.schema';
import { AiPersonalizedMeetingSummaryAccessService } from './ai-personalized-meeting-summary-access.service';
import { AiPersonalizedMeetingSummaryDataBuilderService } from './ai-personalized-meeting-summary-data-builder.service';
import { AiProviderService } from './ai-provider.service';
import { PromptBuilderService } from './prompt-builder.service';

type PersonalizedMeetingSummaryWithTimestamps =
  PersonalizedMeetingSummaryDocument & {
    createdAt?: Date;
    updatedAt?: Date;
  };

type PersonalizedSummaryQuery = {
  workspaceId: string;
  projectId: string;
  userId: string;
  meetingId?: string;
  sprintId?: string | null;
};

@Injectable()
export class AiPersonalizedMeetingSummaryService {
  private readonly rateLimitWindowMs = 10 * 60 * 1000;
  private readonly rateLimitMax = 5;
  private readonly generateHits = new Map<string, number[]>();

  constructor(
    @Optional()
    @InjectModel(PersonalizedMeetingSummary.name)
    private readonly personalizedSummaryModel: Model<PersonalizedMeetingSummaryDocument> | null,
    @Optional()
    @InjectModel(MeetingSummary.name)
    private readonly meetingSummaryModel: Model<MeetingSummaryDocument> | null,
    @Optional()
    @InjectModel(AiPromptLog.name)
    private readonly aiPromptLogModel: Model<AiPromptLogDocument> | null,
    private readonly accessService: AiPersonalizedMeetingSummaryAccessService,
    private readonly dataBuilderService: AiPersonalizedMeetingSummaryDataBuilderService,
    private readonly aiProviderService: AiProviderService,
    private readonly meetingAccessService: MeetingAccessService,
    private readonly meetingParticipantsRepository: MeetingParticipantsRepository,
    private readonly projectAccessService: ProjectAccessService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly aiUserPreferencesService: AiUserPreferencesService,
  ) {}

  async generateMyPersonalizedMeetingSummary(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    dto: GeneratePersonalizedMeetingSummaryDto = {},
  ) {
    this.getPersonalizedSummaryModel();
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    await this.accessService.assertCanUseOwnSummary(
      currentUserId,
      workspaceId,
      meetingId,
    );

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

  async generateMemberPersonalizedMeetingSummary(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    memberId: string,
    dto: GeneratePersonalizedMeetingSummaryDto = {},
  ) {
    this.getPersonalizedSummaryModel();
    await this.accessService.assertCanManageMemberSummary(
      currentUserId,
      workspaceId,
    );
    await this.workspaceAccessService.assertWorkspaceMember(
      memberId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
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

  async generateAllPersonalizedMeetingSummaries(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    dto: GeneratePersonalizedMeetingSummaryDto = {},
  ) {
    this.getPersonalizedSummaryModel();
    await this.accessService.assertCanManageMemberSummary(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    const participants =
      await this.meetingParticipantsRepository.findByMeeting(meetingId);
    const summaries: PersonalizedMeetingSummaryDocument[] = [];

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

  /**
   * System workflow used after the shared meeting summary is ready.
   * This intentionally does not require a manager role: every participant owns
   * their personal view and should not have to wait for an owner to create it.
   */
  async generateAutomaticallyForParticipants(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    this.getPersonalizedSummaryModel();
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    const participants =
      await this.meetingParticipantsRepository.findByMeeting(meetingId);

    const results = await Promise.allSettled(
      participants.map((participant) =>
        this.generateForTargetUser({
          currentUserId,
          workspaceId,
          projectId,
          meeting,
          targetUserId: participant.userId,
          forceRegenerate: false,
        }),
      ),
    );

    return {
      generated: results.filter((result) => result.status === 'fulfilled')
        .length,
      failed: results.filter((result) => result.status === 'rejected').length,
      total: participants.length,
    };
  }

  async getMyPersonalizedMeetingSummary(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    await this.accessService.assertCanUseOwnSummary(
      currentUserId,
      workspaceId,
      meetingId,
    );
    const summary = await this.findLatestPersonalizedSummary({
      workspaceId,
      projectId,
      meetingId,
      userId: currentUserId,
    });

    if (!summary) {
      throw new NotFoundException('Personalized meeting summary not found');
    }

    return {
      success: true,
      message: 'Get my personalized meeting summary successfully',
      data: {
        summary: this.toSummaryResponse(summary),
      },
    };
  }

  async getMemberPersonalizedMeetingSummary(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    memberId: string,
  ) {
    await this.accessService.assertCanManageMemberSummary(
      currentUserId,
      workspaceId,
    );
    await this.workspaceAccessService.assertWorkspaceMember(
      memberId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    await this.accessService.assertTargetParticipant(meetingId, memberId);

    const summary = await this.findLatestPersonalizedSummary({
      workspaceId,
      projectId,
      meetingId,
      userId: memberId,
    });

    if (!summary) {
      throw new NotFoundException('Personalized meeting summary not found');
    }

    return {
      success: true,
      message: 'Get member personalized meeting summary successfully',
      data: {
        summary: this.toSummaryResponse(summary),
      },
    };
  }

  async getPersonalizedMeetingSummaryDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    summaryId: string,
  ) {
    const summaryModel = this.getPersonalizedSummaryModel();
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
      throw new NotFoundException(
        'Personalized meeting summary not found in this project',
      );
    }

    await this.meetingAccessService.assertMeetingInProject(
      summary.meetingId,
      projectId,
    );
    await this.accessService.assertCanViewSummary(
      currentUserId,
      workspaceId,
      summary,
    );

    return {
      success: true,
      message: 'Get personalized meeting summary detail successfully',
      data: {
        summary: this.toSummaryResponse(summary),
      },
    };
  }

  async getMyMeetingActionItems(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetMyMeetingActionItemsQueryDto,
  ) {
    const summaryModel = this.getPersonalizedSummaryModel();
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      currentUserId,
      workspaceId,
    );

    if (!role || role === WorkspaceRole.Viewer) {
      throw new HttpException(
        'You can not view meeting action items',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    this.assertValidActionItemQuery(query);

    const mongoQuery: PersonalizedSummaryQuery = {
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
    const filteredSummaries = summaries.filter((summary) =>
      this.matchesMeetingDateFilter(summary, query),
    );
    const actionItems = filteredSummaries.flatMap((summary) =>
      (summary.aiOutput?.myActionItems ?? []).map((item) =>
        this.toActionItemResponse(summary, item),
      ),
    );
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

  private async generateForTargetUser(params: {
    currentUserId: string;
    workspaceId: string;
    projectId: string;
    meeting: Meeting;
    targetUserId: string;
    forceRegenerate: boolean;
  }) {
    const summaryModel = this.getPersonalizedSummaryModel();
    const sourceSummary = await this.findLatestMeetingSummary(
      params.workspaceId,
      params.projectId,
      params.meeting,
    );

    if (!sourceSummary) {
      throw new NotFoundException('Meeting summary not found');
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

    this.assertGenerateRateLimit(
      params.workspaceId,
      params.projectId,
      params.meeting.id,
      params.targetUserId,
    );

    const inputData =
      await this.dataBuilderService.buildPersonalizedMeetingSummaryInput({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        meeting: params.meeting,
        sourceSummary,
        targetUserId: params.targetUserId,
      });
    const preferences =
      await this.aiUserPreferencesService.getResolvedPreferences(
        params.targetUserId,
      );
    const prompt =
      this.promptBuilderService.buildPersonalizedMeetingSummaryPrompt(
        inputData,
        preferences,
      );
    const startedAt = Date.now();

    try {
      const aiResult =
        await this.aiProviderService.generatePersonalizedMeetingSummary(
          prompt,
          inputData,
        );
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
        status: AiReportStatus.Completed,
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
    } catch (error) {
      await this.writePromptLog({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        userId: params.currentUserId,
        model: process.env.AI_MODEL ?? 'mock-personalized-meeting-summary',
        prompt,
        response: '',
        responseTimeMs: Date.now() - startedAt,
        success: false,
        errorMessage:
          error instanceof Error ? error.message : 'AI provider failed',
      });
      throw new ServiceUnavailableException('AI provider failed');
    }
  }

  private async findLatestMeetingSummary(
    workspaceId: string,
    projectId: string,
    meeting: Meeting,
  ) {
    const summaryModel = this.getMeetingSummaryModel();

    if (meeting.mongoSummaryId) {
      const summary = await summaryModel
        .findById(meeting.mongoSummaryId)
        .exec();

      if (
        summary &&
        summary.workspaceId === workspaceId &&
        summary.projectId === projectId &&
        summary.meetingId === meeting.id
      ) {
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

  private async findLatestPersonalizedSummary(query: {
    workspaceId: string;
    projectId: string;
    meetingId: string;
    userId: string;
  }) {
    return this.getPersonalizedSummaryModel()
      .findOne(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  private assertGenerateRateLimit(
    workspaceId: string,
    projectId: string,
    meetingId: string,
    targetUserId: string,
  ) {
    const key = `${workspaceId}:${projectId}:${meetingId}:${targetUserId}`;
    const now = Date.now();
    const validHits = (this.generateHits.get(key) ?? []).filter(
      (hit) => now - hit < this.rateLimitWindowMs,
    );

    if (validHits.length >= this.rateLimitMax) {
      throw new HttpException(
        'Too many AI personalized meeting summary requests for this user',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    validHits.push(now);
    this.generateHits.set(key, validHits);
  }

  private assertValidActionItemQuery(query: GetMyMeetingActionItemsQueryDto) {
    if (query.fromDate && query.toDate) {
      const fromDate = this.normalizeDate(query.fromDate);
      const toDate = this.normalizeDate(query.toDate);

      if (fromDate > toDate) {
        throw new BadRequestException(
          'fromDate must be before or equal to toDate',
        );
      }
    }
  }

  private matchesMeetingDateFilter(
    summary: PersonalizedMeetingSummaryDocument,
    query: GetMyMeetingActionItemsQueryDto,
  ) {
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

  private extractMeetingDate(summary: PersonalizedMeetingSummaryDocument) {
    const inputData = summary.inputData as {
      meeting?: { meetingDate?: string };
    };

    return inputData.meeting?.meetingDate?.slice(0, 10) ?? null;
  }

  private toActionItemResponse(
    summary: PersonalizedMeetingSummaryDocument,
    actionItem: PersonalizedMeetingActionItem,
  ) {
    const inputData = summary.inputData as {
      meeting?: { title?: string; meetingDate?: string };
    };

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

  private async writePromptLog(payload: {
    workspaceId: string;
    projectId: string;
    userId: string;
    model: string;
    prompt: string;
    response: string;
    responseTimeMs: number;
    success: boolean;
    errorMessage?: string;
  }) {
    if (!this.aiPromptLogModel) {
      return;
    }

    await this.aiPromptLogModel.create({
      workspaceId: payload.workspaceId,
      projectId: payload.projectId,
      userId: payload.userId,
      feature: AiReportType.PersonalizedMeetingSummary,
      aiModel: payload.model,
      prompt: payload.prompt,
      response: payload.response,
      responseTimeMs: payload.responseTimeMs,
      success: payload.success,
      errorMessage: payload.errorMessage ?? null,
    });
  }

  private getPersonalizedSummaryModel() {
    if (!this.personalizedSummaryModel) {
      throw new ServiceUnavailableException('MongoDB is disabled');
    }

    return this.personalizedSummaryModel;
  }

  private getMeetingSummaryModel() {
    if (!this.meetingSummaryModel) {
      throw new ServiceUnavailableException('MongoDB is disabled');
    }

    return this.meetingSummaryModel;
  }

  private getSummaryId(summary: PersonalizedMeetingSummaryDocument) {
    return summary._id.toString();
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }

  private toSummaryResponse(summary: PersonalizedMeetingSummaryDocument) {
    const stampedSummary = summary as PersonalizedMeetingSummaryWithTimestamps;

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
}
