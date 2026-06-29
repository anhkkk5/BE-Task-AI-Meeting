import {
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
import { Meeting } from '../../meetings/entities/meeting.entity';
import { MeetingsRepository } from '../../meetings/repositories/meetings.repository';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { GenerateMeetingSummaryDto } from '../dto/generate-meeting-summary.dto';
import { GetMeetingSummariesQueryDto } from '../dto/get-meeting-summaries-query.dto';
import {
  AiPromptLog,
  AiPromptLogDocument,
} from '../schemas/ai-prompt-log.schema';
import {
  MeetingSummary,
  MeetingSummaryDocument,
} from '../schemas/meeting-summary.schema';
import { AiMeetingSummaryAccessService } from './ai-meeting-summary-access.service';
import { AiMeetingSummaryDataBuilderService } from './ai-meeting-summary-data-builder.service';
import { AiProviderService } from './ai-provider.service';
import { PromptBuilderService } from './prompt-builder.service';

type MeetingSummaryWithTimestamps = MeetingSummaryDocument & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class AiMeetingSummaryService {
  private readonly rateLimitWindowMs = 10 * 60 * 1000;
  private readonly rateLimitMax = 3;
  private readonly generateHits = new Map<string, number[]>();

  constructor(
    @Optional()
    @InjectModel(MeetingSummary.name)
    private readonly meetingSummaryModel: Model<MeetingSummaryDocument> | null,
    @Optional()
    @InjectModel(AiPromptLog.name)
    private readonly aiPromptLogModel: Model<AiPromptLogDocument> | null,
    private readonly accessService: AiMeetingSummaryAccessService,
    private readonly dataBuilderService: AiMeetingSummaryDataBuilderService,
    private readonly aiProviderService: AiProviderService,
    private readonly meetingAccessService: MeetingAccessService,
    private readonly meetingsRepository: MeetingsRepository,
    private readonly projectAccessService: ProjectAccessService,
    private readonly promptBuilderService: PromptBuilderService,
  ) {}

  async generateMeetingSummary(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    dto: GenerateMeetingSummaryDto = {},
  ) {
    const summaryModel = this.getSummaryModel();
    await this.accessService.assertCanGenerateSummary(
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

    if (!dto.forceRegenerate) {
      const existingSummary = await this.findLatestSummary(
        workspaceId,
        projectId,
        meeting,
      );

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
    const prompt =
      this.promptBuilderService.buildMeetingSummaryPrompt(inputData);
    const startedAt = Date.now();

    try {
      const aiResult = await this.aiProviderService.generateMeetingSummary(
        prompt,
        inputData,
      );
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
        status: AiReportStatus.Completed,
        createdBy: currentUserId,
      });
      await this.meetingsRepository.updateSummaryId(
        meeting,
        this.getSummaryId(summary),
      );
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
    } catch (error) {
      await this.writePromptLog({
        workspaceId,
        projectId,
        userId: currentUserId,
        model: process.env.AI_MODEL ?? 'mock-meeting-summary',
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

  async getMeetingSummary(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    this.getSummaryModel();
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    await this.accessService.assertCanViewSummary(
      currentUserId,
      workspaceId,
      meetingId,
    );
    const summary = await this.findLatestSummary(
      workspaceId,
      projectId,
      meeting,
    );

    if (!summary) {
      throw new NotFoundException('Meeting summary not found');
    }

    return {
      success: true,
      message: 'Get meeting summary successfully',
      data: {
        summary: this.toSummaryResponse(summary),
      },
    };
  }

  async getMeetingSummaries(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    query: GetMeetingSummariesQueryDto,
  ) {
    const summaryModel = this.getSummaryModel();
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    await this.accessService.assertCanViewSummary(
      currentUserId,
      workspaceId,
      meetingId,
    );

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

  async getMeetingSummaryDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    summaryId: string,
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
      throw new NotFoundException('Meeting summary not found in this project');
    }

    await this.meetingAccessService.assertMeetingInProject(
      summary.meetingId,
      projectId,
    );
    await this.accessService.assertCanViewSummary(
      currentUserId,
      workspaceId,
      summary.meetingId,
    );

    return {
      success: true,
      message: 'Get meeting summary detail successfully',
      data: {
        summary: this.toSummaryResponse(summary),
      },
    };
  }

  private async findLatestSummary(
    workspaceId: string,
    projectId: string,
    meeting: Meeting,
  ) {
    const summaryModel = this.getSummaryModel();

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

  private assertGenerateRateLimit(
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    const key = `${workspaceId}:${projectId}:${meetingId}`;
    const now = Date.now();
    const validHits = (this.generateHits.get(key) ?? []).filter(
      (hit) => now - hit < this.rateLimitWindowMs,
    );

    if (validHits.length >= this.rateLimitMax) {
      throw new HttpException(
        'Too many AI meeting summary requests for this meeting',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    validHits.push(now);
    this.generateHits.set(key, validHits);
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
      feature: AiReportType.MeetingSummary,
      aiModel: payload.model,
      prompt: payload.prompt,
      response: payload.response,
      responseTimeMs: payload.responseTimeMs,
      success: payload.success,
      errorMessage: payload.errorMessage ?? null,
    });
  }

  private getSummaryModel() {
    if (!this.meetingSummaryModel) {
      throw new ServiceUnavailableException('MongoDB is disabled');
    }

    return this.meetingSummaryModel;
  }

  private getSummaryId(summary: MeetingSummaryDocument) {
    return summary._id.toString();
  }

  private toSummaryResponse(summary: MeetingSummaryDocument) {
    const stampedSummary = summary as MeetingSummaryWithTimestamps;

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
}
