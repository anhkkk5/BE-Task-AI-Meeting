import { BadRequestException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Meeting } from '../entities/meeting.entity';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingAccessService } from './meeting-access.service';
import { MeetingsService } from './meetings.service';

describe('MeetingsService', () => {
  let service: MeetingsService;
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;
  let meetingsRepository: jest.Mocked<
    Pick<
      MeetingsRepository,
      'create' | 'findByIdAndProject' | 'findByProject' | 'update'
    >
  >;
  let meetingParticipantsRepository: jest.Mocked<
    Pick<MeetingParticipantsRepository, 'createMany'>
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
    Pick<
      WorkspaceAccessService,
      'assertWorkspaceActive' | 'assertWorkspaceMember'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<
      ProjectAccessService,
      'assertProjectActive' | 'assertProjectInWorkspace'
    >
  >;
  let sprintAccessService: jest.Mocked<
    Pick<SprintAccessService, 'assertSprintInProject'>
  >;

  const meeting = {
    id: 'meeting-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: 'sprint-id',
    title: 'Sprint Planning',
    description: 'Plan sprint',
    meetingType: MeetingType.SprintPlanning,
    meetingDate: '2026-06-20',
    startTime: new Date('2026-06-20T08:00:00.000Z'),
    endTime: new Date('2026-06-20T09:00:00.000Z'),
    status: MeetingStatus.Scheduled,
    createdBy: 'owner-id',
    mongoTranscriptId: null,
    mongoSummaryId: null,
    participants: [],
    createdAt: new Date('2026-06-20T00:00:00.000Z'),
    updatedAt: new Date('2026-06-20T00:00:00.000Z'),
    deletedAt: null,
  } as Meeting;

  beforeEach(() => {
    dataSource = {
      transaction: jest.fn((callback: (manager: EntityManager) => unknown) =>
        callback({} as EntityManager),
      ),
    };
    meetingsRepository = {
      create: jest.fn(),
      findByIdAndProject: jest.fn(),
      findByProject: jest.fn(),
      update: jest.fn(),
    };
    meetingParticipantsRepository = {
      createMany: jest.fn(),
    };
    meetingAccessService = {
      assertMeetingEditable: jest.fn(),
      assertMeetingInProject: jest.fn(),
      assertUserCanManageMeeting: jest.fn(),
      assertUserCanViewMeeting: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceActive: jest.fn(),
      assertWorkspaceMember: jest.fn(),
    };
    projectAccessService = {
      assertProjectActive: jest.fn(),
      assertProjectInWorkspace: jest.fn(),
    };
    sprintAccessService = {
      assertSprintInProject: jest.fn(),
    };

    meetingsRepository.create.mockResolvedValue(meeting);
    meetingsRepository.findByIdAndProject.mockResolvedValue(meeting);
    meetingsRepository.findByProject.mockResolvedValue({
      items: [meeting],
      total: 1,
      page: 1,
      limit: 20,
    });
    meetingsRepository.update.mockResolvedValue(meeting);

    service = new MeetingsService(
      dataSource as unknown as DataSource,
      meetingsRepository as unknown as MeetingsRepository,
      meetingParticipantsRepository as unknown as MeetingParticipantsRepository,
      meetingAccessService as unknown as MeetingAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      projectAccessService as unknown as ProjectAccessService,
      sprintAccessService as unknown as SprintAccessService,
    );
  });

  it('creates meeting from params/current user and adds creator as HOST', async () => {
    const response = await service.createMeeting(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        sprintId: 'sprint-id',
        title: ' Sprint Planning ',
        description: ' Plan sprint ',
        meetingType: MeetingType.SprintPlanning,
        meetingDate: '2026-06-20',
        startTime: '2026-06-20T08:00:00.000Z',
        endTime: '2026-06-20T09:00:00.000Z',
        participantIds: ['member-id'],
      },
    );

    expect(
      meetingAccessService.assertUserCanManageMeeting,
    ).toHaveBeenCalledWith('owner-id', 'workspace-id');
    expect(sprintAccessService.assertSprintInProject).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
    expect(meetingsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        createdBy: 'owner-id',
        title: 'Sprint Planning',
        description: 'Plan sprint',
      }),
      expect.any(Object),
    );
    expect(meetingParticipantsRepository.createMany).toHaveBeenCalledWith(
      [
        {
          attended: true,
          meetingId: 'meeting-id',
          role: MeetingParticipantRole.Host,
          userId: 'owner-id',
        },
        {
          attended: false,
          meetingId: 'meeting-id',
          role: MeetingParticipantRole.Participant,
          userId: 'member-id',
        },
      ],
      expect.any(Object),
    );
    expect(response.data.meeting.id).toBe('meeting-id');
  });

  it('rejects invalid time range before creating meeting', async () => {
    await expect(
      service.createMeeting('owner-id', 'workspace-id', 'project-id', {
        title: 'Daily Scrum',
        meetingDate: '2026-06-20',
        startTime: '2026-06-20T09:00:00.000Z',
        endTime: '2026-06-20T08:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(meetingsRepository.create).not.toHaveBeenCalled();
  });

  it('gets meetings only after member, project and sprint filter checks', async () => {
    const response = await service.getMeetings(
      'member-id',
      'workspace-id',
      'project-id',
      {
        sprintId: 'sprint-id',
        page: 1,
        limit: 20,
      },
    );

    expect(meetingAccessService.assertUserCanViewMeeting).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(projectAccessService.assertProjectInWorkspace).toHaveBeenCalledWith(
      'project-id',
      'workspace-id',
    );
    expect(sprintAccessService.assertSprintInProject).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
    expect(response.data.items).toHaveLength(1);
  });

  it('rejects inverted date filters', async () => {
    await expect(
      service.getMeetings('member-id', 'workspace-id', 'project-id', {
        fromDate: '2026-06-30',
        toDate: '2026-06-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(meetingsRepository.findByProject).not.toHaveBeenCalled();
  });

  it('updates meeting without accepting project/workspace/createdBy from dto', async () => {
    meetingAccessService.assertMeetingInProject.mockResolvedValue(meeting);

    await service.updateMeeting(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {
        title: ' Updated meeting ',
      },
    );

    expect(meetingAccessService.assertMeetingInProject).toHaveBeenCalledWith(
      'meeting-id',
      'project-id',
    );
    expect(meetingAccessService.assertMeetingEditable).toHaveBeenCalledWith(
      meeting,
    );
    const updatePayload = meetingsRepository.update.mock.calls[0][1];

    expect(updatePayload).toMatchObject({ title: 'Updated meeting' });
    expect(updatePayload).not.toHaveProperty('projectId');
    expect(updatePayload).not.toHaveProperty('workspaceId');
    expect(updatePayload).not.toHaveProperty('createdBy');
  });

  it('changes status without hard deleting meeting', async () => {
    meetingAccessService.assertMeetingInProject.mockResolvedValue(meeting);

    const response = await service.cancelMeeting(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
    );

    expect(meetingsRepository.update).toHaveBeenCalledWith(meeting, {
      status: MeetingStatus.Cancelled,
    });
    expect(response.data).toBeNull();
  });
});
