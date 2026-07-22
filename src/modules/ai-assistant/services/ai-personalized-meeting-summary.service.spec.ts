import { ServiceUnavailableException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AiUserPreferencesService } from '../../users/services/ai-user-preferences.service';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import {
  MeetingSummaryDocument,
  MeetingSummaryOutput,
} from '../schemas/meeting-summary.schema';
import {
  PersonalizedMeetingSummaryDocument,
  PersonalizedMeetingSummaryOutput,
} from '../schemas/personalized-meeting-summary.schema';
import { AiPersonalizedMeetingSummaryAccessService } from './ai-personalized-meeting-summary-access.service';
import {
  AiPersonalizedMeetingSummaryDataBuilderService,
  PersonalizedMeetingSummaryInputData,
} from './ai-personalized-meeting-summary-data-builder.service';
import { AiPersonalizedMeetingSummaryService } from './ai-personalized-meeting-summary.service';
import { AiProviderService } from './ai-provider.service';
import { PromptBuilderService } from './prompt-builder.service';

type PersonalizedModelMock = Pick<
  Model<PersonalizedMeetingSummaryDocument>,
  'create' | 'find' | 'findById' | 'findOne'
>;

type MeetingSummaryModelMock = Pick<
  Model<MeetingSummaryDocument>,
  'findById' | 'findOne'
>;

function queryResult<T>(value: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

describe('AiPersonalizedMeetingSummaryService', () => {
  let personalizedModel: jest.Mocked<PersonalizedModelMock>;
  let meetingSummaryModel: jest.Mocked<MeetingSummaryModelMock>;
  let promptLogModel: jest.Mocked<Pick<Model<AiPromptLogDocument>, 'create'>>;
  let accessService: jest.Mocked<
    Pick<
      AiPersonalizedMeetingSummaryAccessService,
      | 'assertCanManageMemberSummary'
      | 'assertCanUseOwnSummary'
      | 'assertCanViewSummary'
      | 'assertTargetParticipant'
    >
  >;
  let dataBuilderService: jest.Mocked<
    Pick<
      AiPersonalizedMeetingSummaryDataBuilderService,
      'buildPersonalizedMeetingSummaryInput'
    >
  >;
  let aiProviderService: jest.Mocked<
    Pick<AiProviderService, 'generatePersonalizedMeetingSummary'>
  >;
  let meetingAccessService: jest.Mocked<
    Pick<MeetingAccessService, 'assertMeetingInProject'>
  >;
  let meetingParticipantsRepository: jest.Mocked<
    Pick<MeetingParticipantsRepository, 'findByMeeting'>
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;
  let promptBuilderService: jest.Mocked<
    Pick<PromptBuilderService, 'buildPersonalizedMeetingSummaryPrompt'>
  >;
  let workspaceAccessService: jest.Mocked<
    Pick<
      WorkspaceAccessService,
      'assertWorkspaceMember' | 'getUserWorkspaceRole'
    >
  >;
  let aiUserPreferencesService: jest.Mocked<
    Pick<AiUserPreferencesService, 'getResolvedPreferences'>
  >;
  let service: AiPersonalizedMeetingSummaryService;

  const sourceSummaryId = new Types.ObjectId();
  const personalizedSummaryId = new Types.ObjectId();
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
    mongoTranscriptId: 'transcript-id',
    mongoSummaryId: sourceSummaryId.toString(),
    sprint: null,
    createdAt: new Date('2026-06-25T00:00:00.000Z'),
    updatedAt: new Date('2026-06-25T00:00:00.000Z'),
    deletedAt: null,
  } as Meeting;
  const meetingSummaryOutput: MeetingSummaryOutput = {
    title: 'Tom tat meeting',
    summary: 'Team thong nhat sprint goal.',
    keyPoints: ['Nguyen Van B can lam API'],
    decisions: ['Nguyen Van B thong nhat lam API'],
    actionItems: [
      {
        text: 'Nguyen Van B: Em se tao API',
        assigneeName: 'Nguyen Van B',
        assigneeUserId: null,
        dueDate: null,
        status: 'OPEN',
        source: 'Nguyen Van B: Em se tao API',
      },
    ],
    risks: [],
    openQuestions: [],
    nextSteps: ['Nguyen Van B: Em se tao API'],
    generatedText: 'Generated meeting summary',
  };
  const sourceSummary = {
    _id: sourceSummaryId,
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    meetingId: 'meeting-id',
    transcriptId: 'transcript-id',
    title: meetingSummaryOutput.title,
    summary: meetingSummaryOutput.summary,
    keyPoints: meetingSummaryOutput.keyPoints,
    decisions: meetingSummaryOutput.decisions,
    actionItems: meetingSummaryOutput.actionItems,
    risks: meetingSummaryOutput.risks,
    openQuestions: meetingSummaryOutput.openQuestions,
    nextSteps: meetingSummaryOutput.nextSteps,
    aiOutput: meetingSummaryOutput,
    aiModel: 'mock-meeting-summary',
    status: AiReportStatus.Completed,
    createdBy: 'owner-id',
  } as unknown as MeetingSummaryDocument;
  const personalizedOutput: PersonalizedMeetingSummaryOutput = {
    title: 'Tom tat ca nhan hoa - Nguyen Van B',
    personalSummary: 'Nguyen Van B can lam API.',
    relevantDecisions: ['Nguyen Van B thong nhat lam API'],
    myActionItems: [
      {
        title: 'Nguyen Van B: Em se tao API',
        assigneeId: null,
        assigneeName: 'Nguyen Van B',
        deadline: null,
        source: 'Nguyen Van B: Em se tao API',
      },
    ],
    mentions: ['Nguyen Van B: Em se tao API'],
    risks: [],
    nextSteps: ['Nguyen Van B: Em se tao API'],
    generatedText: 'Generated personalized summary',
  };
  const inputData: PersonalizedMeetingSummaryInputData = {
    workspace: {
      id: 'workspace-id',
    },
    project: {
      id: 'project-id',
      name: 'Project',
      keyCode: 'AGILEAI',
      status: 'ACTIVE',
    },
    sprint: null,
    meeting: {
      id: 'meeting-id',
      title: 'Sprint Planning',
      description: null,
      meetingType: 'SPRINT_PLANNING',
      meetingDate: '2026-06-25',
      status: 'COMPLETED',
    },
    targetUser: {
      userId: 'member-id',
      fullName: 'Nguyen Van B',
      email: 'member@example.com',
    },
    participants: [
      {
        userId: 'member-id',
        fullName: 'Nguyen Van B',
        email: 'member@example.com',
        role: 'PARTICIPANT',
        attended: true,
      },
    ],
    meetingSummary: {
      id: sourceSummaryId.toString(),
      title: meetingSummaryOutput.title,
      summary: meetingSummaryOutput.summary,
      keyPoints: meetingSummaryOutput.keyPoints,
      decisions: meetingSummaryOutput.decisions,
      actionItems: meetingSummaryOutput.actionItems,
      risks: [],
      openQuestions: [],
      nextSteps: meetingSummaryOutput.nextSteps,
    },
    relatedTranscriptSnippets: ['Nguyen Van B: Em se tao API'],
    targetActionItems: meetingSummaryOutput.actionItems,
    transcriptId: 'transcript-id',
    generatedAt: '2026-06-25T00:00:00.000Z',
  };
  const personalizedSummary = {
    _id: personalizedSummaryId,
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    meetingId: 'meeting-id',
    userId: 'member-id',
    sourceSummaryId: sourceSummaryId.toString(),
    transcriptId: 'transcript-id',
    inputData,
    aiOutput: personalizedOutput,
    aiModel: 'mock-personalized-meeting-summary',
    status: AiReportStatus.Completed,
    createdBy: 'member-id',
    createdAt: new Date('2026-06-25T00:00:00.000Z'),
    updatedAt: new Date('2026-06-25T00:00:00.000Z'),
  } as unknown as PersonalizedMeetingSummaryDocument;

  beforeEach(() => {
    personalizedModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
    };
    meetingSummaryModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
    };
    promptLogModel = {
      create: jest.fn(),
    };
    accessService = {
      assertCanManageMemberSummary: jest.fn(),
      assertCanUseOwnSummary: jest.fn(),
      assertCanViewSummary: jest.fn(),
      assertTargetParticipant: jest.fn(),
    };
    dataBuilderService = {
      buildPersonalizedMeetingSummaryInput: jest.fn(),
    };
    aiProviderService = {
      generatePersonalizedMeetingSummary: jest.fn(),
    };
    meetingAccessService = {
      assertMeetingInProject: jest.fn(),
    };
    meetingParticipantsRepository = {
      findByMeeting: jest.fn(),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn(),
    };
    promptBuilderService = {
      buildPersonalizedMeetingSummaryPrompt: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceMember: jest.fn(),
      getUserWorkspaceRole: jest.fn(),
    };
    aiUserPreferencesService = {
      getResolvedPreferences: jest.fn().mockResolvedValue({
        responseStyle: 'BALANCED',
        tone: 'PROFESSIONAL',
        focusAreas: ['PROGRESS', 'BLOCKERS', 'DECISIONS', 'ACTION_ITEMS'],
      }),
    } as never;

    personalizedModel.create.mockResolvedValue(personalizedSummary);
    personalizedModel.find.mockReturnValue(
      queryResult([personalizedSummary]) as never,
    );
    personalizedModel.findById.mockReturnValue(
      queryResult(personalizedSummary) as never,
    );
    personalizedModel.findOne.mockReturnValue(queryResult(null) as never);
    meetingSummaryModel.findById.mockReturnValue(
      queryResult(sourceSummary) as never,
    );
    meetingSummaryModel.findOne.mockReturnValue(
      queryResult(sourceSummary) as never,
    );
    meetingAccessService.assertMeetingInProject.mockResolvedValue(meeting);
    meetingParticipantsRepository.findByMeeting.mockResolvedValue([
      {
        userId: 'member-id',
      },
    ] as never);
    dataBuilderService.buildPersonalizedMeetingSummaryInput.mockResolvedValue(
      inputData,
    );
    promptBuilderService.buildPersonalizedMeetingSummaryPrompt.mockReturnValue(
      'safe personalized prompt',
    );
    aiProviderService.generatePersonalizedMeetingSummary.mockResolvedValue({
      model: 'mock-personalized-meeting-summary',
      output: personalizedOutput,
      rawResponse: JSON.stringify(personalizedOutput),
    });
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Member,
    );

    service = new AiPersonalizedMeetingSummaryService(
      personalizedModel as unknown as Model<PersonalizedMeetingSummaryDocument>,
      meetingSummaryModel as unknown as Model<MeetingSummaryDocument>,
      promptLogModel as unknown as Model<AiPromptLogDocument>,
      accessService as unknown as AiPersonalizedMeetingSummaryAccessService,
      dataBuilderService as unknown as AiPersonalizedMeetingSummaryDataBuilderService,
      aiProviderService as unknown as AiProviderService,
      meetingAccessService as unknown as MeetingAccessService,
      meetingParticipantsRepository as unknown as MeetingParticipantsRepository,
      projectAccessService as unknown as ProjectAccessService,
      promptBuilderService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      aiUserPreferencesService as unknown as AiUserPreferencesService,
    );
  });

  it('generates my personalized summary from source meeting summary', async () => {
    const response = await service.generateMyPersonalizedMeetingSummary(
      'member-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {},
    );

    expect(accessService.assertCanUseOwnSummary).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
      'meeting-id',
    );
    expect(
      dataBuilderService.buildPersonalizedMeetingSummaryInput,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      meeting,
      sourceSummary,
      targetUserId: 'member-id',
    });
    expect(personalizedModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        meetingId: 'meeting-id',
        userId: 'member-id',
        sourceSummaryId: sourceSummaryId.toString(),
        createdBy: 'member-id',
      }),
    );
    expect(promptLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: AiReportType.PersonalizedMeetingSummary,
        prompt: 'safe personalized prompt',
        success: true,
      }),
    );
    expect(response.data.summary.userId).toBe('member-id');
  });

  it('returns existing personalized summary when forceRegenerate is false', async () => {
    personalizedModel.findOne.mockReturnValue(
      queryResult(personalizedSummary) as never,
    );

    const response = await service.generateMyPersonalizedMeetingSummary(
      'member-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {},
    );

    expect(
      aiProviderService.generatePersonalizedMeetingSummary,
    ).not.toHaveBeenCalled();
    expect(personalizedModel.create).not.toHaveBeenCalled();
    expect(response.data.summary.id).toBe(personalizedSummaryId.toString());
  });

  it('generates member personalized summary only through manager flow', async () => {
    await service.generateMemberPersonalizedMeetingSummary(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      'member-id',
      { forceRegenerate: true },
    );

    expect(accessService.assertCanManageMemberSummary).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
    );
    expect(workspaceAccessService.assertWorkspaceMember).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(accessService.assertTargetParticipant).toHaveBeenCalledWith(
      'meeting-id',
      'member-id',
    );
  });

  it('gets my action items from personalized summaries', async () => {
    const response = await service.getMyMeetingActionItems(
      'member-id',
      'workspace-id',
      'project-id',
      {
        page: 1,
        limit: 20,
      },
    );

    expect(personalizedModel.find).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      userId: 'member-id',
    });
    expect(response.data.items).toHaveLength(1);
    expect(response.data.items[0].deadline).toBeNull();
  });

  it('returns 503 when MongoDB is disabled', async () => {
    const disabledService = new AiPersonalizedMeetingSummaryService(
      null,
      null,
      null,
      accessService as unknown as AiPersonalizedMeetingSummaryAccessService,
      dataBuilderService as unknown as AiPersonalizedMeetingSummaryDataBuilderService,
      aiProviderService as unknown as AiProviderService,
      meetingAccessService as unknown as MeetingAccessService,
      meetingParticipantsRepository as unknown as MeetingParticipantsRepository,
      projectAccessService as unknown as ProjectAccessService,
      promptBuilderService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      aiUserPreferencesService as unknown as AiUserPreferencesService,
    );

    await expect(
      disabledService.generateMyPersonalizedMeetingSummary(
        'member-id',
        'workspace-id',
        'project-id',
        'meeting-id',
        {},
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
