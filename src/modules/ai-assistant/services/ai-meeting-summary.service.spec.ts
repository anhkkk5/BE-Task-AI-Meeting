import { ServiceUnavailableException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { MeetingsRepository } from '../../meetings/repositories/meetings.repository';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import {
  MeetingSummaryDocument,
  MeetingSummaryOutput,
} from '../schemas/meeting-summary.schema';
import { AiMeetingSummaryAccessService } from './ai-meeting-summary-access.service';
import {
  AiMeetingSummaryDataBuilderService,
  MeetingSummaryInputData,
} from './ai-meeting-summary-data-builder.service';
import { AiMeetingSummaryService } from './ai-meeting-summary.service';
import { AiProviderService } from './ai-provider.service';
import { PromptBuilderService } from './prompt-builder.service';

type SummaryModelMock = Pick<
  Model<MeetingSummaryDocument>,
  'countDocuments' | 'create' | 'find' | 'findById' | 'findOne'
>;

function queryResult<T>(value: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

describe('AiMeetingSummaryService', () => {
  let summaryModel: jest.Mocked<SummaryModelMock>;
  let promptLogModel: jest.Mocked<Pick<Model<AiPromptLogDocument>, 'create'>>;
  let accessService: jest.Mocked<
    Pick<
      AiMeetingSummaryAccessService,
      'assertCanGenerateSummary' | 'assertCanViewSummary'
    >
  >;
  let dataBuilderService: jest.Mocked<
    Pick<AiMeetingSummaryDataBuilderService, 'buildMeetingSummaryInput'>
  >;
  let aiProviderService: jest.Mocked<
    Pick<AiProviderService, 'generateMeetingSummary'>
  >;
  let meetingAccessService: jest.Mocked<
    Pick<MeetingAccessService, 'assertMeetingInProject'>
  >;
  let meetingsRepository: jest.Mocked<
    Pick<MeetingsRepository, 'updateSummaryId'>
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;
  let promptBuilderService: jest.Mocked<
    Pick<PromptBuilderService, 'buildMeetingSummaryPrompt'>
  >;
  let service: AiMeetingSummaryService;

  const summaryId = new Types.ObjectId();
  const transcriptId = new Types.ObjectId().toString();
  const meeting = {
    id: 'meeting-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    title: 'Sprint Planning',
    description: null,
    meetingType: MeetingType.SprintPlanning,
    meetingDate: '2026-06-25',
    startTime: null,
    endTime: null,
    status: MeetingStatus.Completed,
    createdBy: 'owner-id',
    mongoTranscriptId: transcriptId,
    mongoSummaryId: null,
    sprint: null,
    createdAt: new Date('2026-06-25T00:00:00.000Z'),
    updatedAt: new Date('2026-06-25T00:00:00.000Z'),
    deletedAt: null,
  } as Meeting;
  const aiOutput: MeetingSummaryOutput = {
    title: 'Tom tat meeting - Sprint Planning',
    summary: 'Team thong nhat sprint goal.',
    keyPoints: ['Nguyen Van A: Thong nhat sprint goal'],
    decisions: ['Nguyen Van A: Thong nhat sprint goal'],
    actionItems: [
      {
        text: 'Nguyen Van B: Em se tao task API',
        assigneeName: 'Nguyen Van B',
        assigneeUserId: null,
        dueDate: null,
        status: 'OPEN',
        source: 'Nguyen Van B: Em se tao task API',
      },
    ],
    risks: [],
    openQuestions: [],
    nextSteps: ['Nguyen Van B: Em se tao task API'],
    generatedText: 'Generated meeting summary',
  };
  const summary = {
    _id: summaryId,
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    meetingId: 'meeting-id',
    transcriptId,
    title: aiOutput.title,
    summary: aiOutput.summary,
    keyPoints: aiOutput.keyPoints,
    decisions: aiOutput.decisions,
    actionItems: aiOutput.actionItems,
    risks: aiOutput.risks,
    openQuestions: aiOutput.openQuestions,
    nextSteps: aiOutput.nextSteps,
    aiOutput,
    aiModel: 'mock-meeting-summary',
    status: AiReportStatus.Completed,
    createdBy: 'owner-id',
    createdAt: new Date('2026-06-25T00:00:00.000Z'),
    updatedAt: new Date('2026-06-25T00:00:00.000Z'),
  } as unknown as MeetingSummaryDocument;
  const inputData: MeetingSummaryInputData = {
    workspace: {
      id: 'workspace-id',
    },
    project: {
      id: 'project-id',
      name: 'Project',
      keyCode: 'AGILEAI',
      status: 'ACTIVE',
    },
    meeting: {
      id: 'meeting-id',
      title: 'Sprint Planning',
      description: null,
      meetingType: 'SPRINT_PLANNING',
      meetingDate: '2026-06-25',
      status: 'COMPLETED',
      startTime: null,
      endTime: null,
    },
    sprint: null,
    participants: [
      {
        userId: 'member-id',
        fullName: 'Nguyen Van B',
        email: 'member@example.com',
        role: 'PARTICIPANT',
        attended: true,
      },
    ],
    transcript: {
      id: transcriptId,
      rawTranscript:
        'Nguyen Van A: Thong nhat sprint goal\nNguyen Van B: Em se tao task API',
      normalizedTranscript:
        'Nguyen Van A: Thong nhat sprint goal\nNguyen Van B: Em se tao task API',
      speakers: [],
    },
    generatedAt: '2026-06-25T00:00:00.000Z',
  };

  beforeEach(() => {
    summaryModel = {
      countDocuments: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
    };
    promptLogModel = {
      create: jest.fn(),
    };
    accessService = {
      assertCanGenerateSummary: jest.fn(),
      assertCanViewSummary: jest.fn(),
    };
    dataBuilderService = {
      buildMeetingSummaryInput: jest.fn(),
    };
    aiProviderService = {
      generateMeetingSummary: jest.fn(),
    };
    meetingAccessService = {
      assertMeetingInProject: jest.fn(),
    };
    meetingsRepository = {
      updateSummaryId: jest.fn(),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn(),
    };
    promptBuilderService = {
      buildMeetingSummaryPrompt: jest.fn(),
    };

    summaryModel.create.mockResolvedValue(summary as never);
    summaryModel.find.mockReturnValue(queryResult([summary]) as never);
    summaryModel.countDocuments.mockReturnValue(queryResult(1) as never);
    summaryModel.findById.mockReturnValue(queryResult(summary) as never);
    summaryModel.findOne.mockReturnValue(queryResult(summary) as never);
    meetingAccessService.assertMeetingInProject.mockResolvedValue(meeting);
    dataBuilderService.buildMeetingSummaryInput.mockResolvedValue(
      inputData as never,
    );
    promptBuilderService.buildMeetingSummaryPrompt.mockReturnValue(
      'safe meeting prompt',
    );
    aiProviderService.generateMeetingSummary.mockResolvedValue({
      model: 'mock-meeting-summary',
      output: aiOutput,
      rawResponse: JSON.stringify(aiOutput),
    });

    service = new AiMeetingSummaryService(
      summaryModel as unknown as Model<MeetingSummaryDocument>,
      promptLogModel as unknown as Model<AiPromptLogDocument>,
      accessService as unknown as AiMeetingSummaryAccessService,
      dataBuilderService as unknown as AiMeetingSummaryDataBuilderService,
      aiProviderService as unknown as AiProviderService,
      meetingAccessService as unknown as MeetingAccessService,
      meetingsRepository as unknown as MeetingsRepository,
      projectAccessService as unknown as ProjectAccessService,
      promptBuilderService as unknown as PromptBuilderService,
    );
  });

  it('generates meeting summary from transcript and logs prompt', async () => {
    summaryModel.findOne.mockReturnValue(queryResult(null) as never);

    const response = await service.generateMeetingSummary(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {},
    );

    expect(accessService.assertCanGenerateSummary).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
    );
    expect(dataBuilderService.buildMeetingSummaryInput).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      meeting,
    });
    expect(summaryModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        meetingId: 'meeting-id',
        transcriptId,
        createdBy: 'owner-id',
        status: AiReportStatus.Completed,
      }),
    );
    expect(meetingsRepository.updateSummaryId).toHaveBeenCalledWith(
      meeting,
      summaryId.toString(),
    );
    expect(promptLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: AiReportType.MeetingSummary,
        prompt: 'safe meeting prompt',
        success: true,
      }),
    );
    expect(response.data.summary.id).toBe(summaryId.toString());
  });

  it('returns existing summary when forceRegenerate is false', async () => {
    const response = await service.generateMeetingSummary(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {},
    );

    expect(aiProviderService.generateMeetingSummary).not.toHaveBeenCalled();
    expect(summaryModel.create).not.toHaveBeenCalled();
    expect(response.data.summary.id).toBe(summaryId.toString());
  });

  it('gets latest summary after view access check', async () => {
    const response = await service.getMeetingSummary(
      'member-id',
      'workspace-id',
      'project-id',
      'meeting-id',
    );

    expect(accessService.assertCanViewSummary).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
      'meeting-id',
    );
    expect(response.data.summary.summary).toBe(aiOutput.summary);
  });

  it('gets summary history for a meeting', async () => {
    const response = await service.getMeetingSummaries(
      'member-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      { page: 1, limit: 10 },
    );

    expect(summaryModel.find).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      meetingId: 'meeting-id',
    });
    expect(response.data.items).toHaveLength(1);
    expect(response.data.meta.total).toBe(1);
  });

  it('gets summary detail by id', async () => {
    const response = await service.getMeetingSummaryDetail(
      'member-id',
      'workspace-id',
      'project-id',
      summaryId.toString(),
    );

    expect(summaryModel.findById).toHaveBeenCalledWith(summaryId.toString());
    expect(accessService.assertCanViewSummary).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
      'meeting-id',
    );
    expect(response.data.summary.aiOutput.generatedText).toBe(
      'Generated meeting summary',
    );
  });

  it('returns 503 when MongoDB is disabled', async () => {
    const disabledService = new AiMeetingSummaryService(
      null,
      null,
      accessService as unknown as AiMeetingSummaryAccessService,
      dataBuilderService as unknown as AiMeetingSummaryDataBuilderService,
      aiProviderService as unknown as AiProviderService,
      meetingAccessService as unknown as MeetingAccessService,
      meetingsRepository as unknown as MeetingsRepository,
      projectAccessService as unknown as ProjectAccessService,
      promptBuilderService as unknown as PromptBuilderService,
    );

    await expect(
      disabledService.generateMeetingSummary(
        'owner-id',
        'workspace-id',
        'project-id',
        'meeting-id',
        {},
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
