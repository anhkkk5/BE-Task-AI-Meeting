import { ServiceUnavailableException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Meeting } from '../entities/meeting.entity';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingTranscriptDocument } from '../schemas/meeting-transcript.schema';
import { MeetingAccessService } from './meeting-access.service';
import { MeetingTranscriptsService } from './meeting-transcripts.service';

type TranscriptModelMock = Pick<
  Model<MeetingTranscriptDocument>,
  'create' | 'findById' | 'findByIdAndUpdate'
>;

describe('MeetingTranscriptsService', () => {
  let service: MeetingTranscriptsService;
  let transcriptModel: jest.Mocked<TranscriptModelMock>;
  let meetingsRepository: jest.Mocked<
    Pick<MeetingsRepository, 'updateTranscriptId'>
  >;
  let meetingParticipantsRepository: jest.Mocked<
    Pick<MeetingParticipantsRepository, 'findByMeetingAndUser'>
  >;
  let meetingAccessService: jest.Mocked<
    Pick<
      MeetingAccessService,
      | 'assertMeetingEditable'
      | 'assertMeetingInProject'
      | 'assertUserCanManageMeeting'
      | 'assertUserCanViewMeeting'
    >
  >;
  let workspaceAccessService: jest.Mocked<
    Pick<WorkspaceAccessService, 'assertWorkspaceActive'>
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;

  const meeting = {
    id: 'meeting-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    title: 'Daily Scrum',
    description: null,
    meetingType: MeetingType.DailyScrum,
    meetingDate: '2026-06-20',
    startTime: null,
    endTime: null,
    status: MeetingStatus.Scheduled,
    createdBy: 'owner-id',
    mongoTranscriptId: null,
    mongoSummaryId: null,
    createdAt: new Date('2026-06-20T00:00:00.000Z'),
    updatedAt: new Date('2026-06-20T00:00:00.000Z'),
    deletedAt: null,
  } as Meeting;

  const transcriptId = new Types.ObjectId();
  const transcript = {
    _id: transcriptId,
    meetingId: 'meeting-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    rawTranscript: 'Nguyen Van A: Daily scrum',
    speakers: [],
    liveSegments: [],
    createdBy: 'owner-id',
    createdAt: new Date('2026-06-20T00:00:00.000Z'),
    updatedAt: new Date('2026-06-20T00:00:00.000Z'),
    save: jest.fn().mockResolvedValue(undefined),
  } as unknown as MeetingTranscriptDocument;

  beforeEach(() => {
    transcriptModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    meetingsRepository = {
      updateTranscriptId: jest.fn(),
    };
    meetingParticipantsRepository = {
      findByMeetingAndUser: jest.fn(),
    };
    meetingAccessService = {
      assertMeetingEditable: jest.fn(),
      assertMeetingInProject: jest.fn(),
      assertUserCanManageMeeting: jest.fn(),
      assertUserCanViewMeeting: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceActive: jest.fn(),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn(),
    };

    transcriptModel.create.mockResolvedValue(transcript);
    transcriptModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(transcript),
    } as never);
    transcriptModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(transcript),
    } as never);
    meetingAccessService.assertMeetingInProject.mockResolvedValue(meeting);
    meetingParticipantsRepository.findByMeetingAndUser.mockResolvedValue({
      userId: 'owner-id',
      user: {
        fullName: 'Nguyen Van A',
        email: 'owner@example.com',
      },
    } as never);

    service = new MeetingTranscriptsService(
      transcriptModel as unknown as Model<MeetingTranscriptDocument>,
      meetingsRepository as unknown as MeetingsRepository,
      meetingParticipantsRepository as unknown as MeetingParticipantsRepository,
      meetingAccessService as unknown as MeetingAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      projectAccessService as unknown as ProjectAccessService,
    );
  });

  it('returns 503 when MongoDB provider is disabled', async () => {
    const disabledService = new MeetingTranscriptsService(
      null,
      meetingsRepository as unknown as MeetingsRepository,
      meetingParticipantsRepository as unknown as MeetingParticipantsRepository,
      meetingAccessService as unknown as MeetingAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      projectAccessService as unknown as ProjectAccessService,
    );

    await expect(
      disabledService.saveTranscript(
        'owner-id',
        'workspace-id',
        'project-id',
        'meeting-id',
        { rawTranscript: 'Transcript' },
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('saves transcript in MongoDB and stores mongo id in MySQL meeting', async () => {
    const response = await service.saveTranscript(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {
        rawTranscript: ' Nguyen Van A: Daily scrum ',
        speakers: [{ speakerName: ' Nguyen Van A ', text: ' Hello ' }],
      },
    );

    expect(
      meetingAccessService.assertUserCanManageMeeting,
    ).toHaveBeenCalledWith('owner-id', 'workspace-id');
    expect(transcriptModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        meetingId: 'meeting-id',
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        rawTranscript: 'Nguyen Van A: Daily scrum',
        createdBy: 'owner-id',
      }),
    );
    expect(meetingsRepository.updateTranscriptId).toHaveBeenCalledWith(
      meeting,
      transcriptId.toString(),
    );
    expect(response.data.transcript.id).toBe(transcriptId.toString());
  });

  it('loads transcript by meeting mongoTranscriptId', async () => {
    meetingAccessService.assertMeetingInProject.mockResolvedValue({
      ...meeting,
      mongoTranscriptId: transcriptId.toString(),
    });

    const response = await service.getTranscript(
      'member-id',
      'workspace-id',
      'project-id',
      'meeting-id',
    );

    expect(meetingAccessService.assertUserCanViewMeeting).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(transcriptModel.findById).toHaveBeenCalledWith(
      transcriptId.toString(),
    );
    expect(response.data.transcript.rawTranscript).toBe(
      'Nguyen Van A: Daily scrum',
    );
  });

  it('appends live segment and rebuilds speaker transcript by current user', async () => {
    meetingAccessService.assertMeetingInProject.mockResolvedValue({
      ...meeting,
      mongoTranscriptId: transcriptId.toString(),
    });

    const response = await service.appendLiveSegment(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {
        text: ' Em da import backlog tu Excel ',
        startedAt: '2026-06-20T08:00:00.000Z',
      },
    );

    expect(meetingAccessService.assertUserCanViewMeeting).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
    );
    expect(transcriptModel.findById).toHaveBeenCalledWith(
      transcriptId.toString(),
    );
    expect(transcript.save).toHaveBeenCalled();
    expect(response.data.transcript.rawTranscript).toContain(
      'Nguyen Van A: Em da import backlog tu Excel',
    );
    expect(response.data.transcript.liveSegments).toHaveLength(1);
  });
});
