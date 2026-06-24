import { ConflictException, ForbiddenException } from '@nestjs/common';
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingAccessService } from './meeting-access.service';
import { MeetingParticipantsService } from './meeting-participants.service';

describe('MeetingParticipantsService', () => {
  let service: MeetingParticipantsService;
  let meetingParticipantsRepository: jest.Mocked<
    Pick<
      MeetingParticipantsRepository,
      | 'createMany'
      | 'findByIdAndMeeting'
      | 'findByMeeting'
      | 'findByMeetingAndUsers'
      | 'update'
    >
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
      'assertWorkspaceActive' | 'assertWorkspaceMember' | 'getUserWorkspaceRole'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;

  const participant = {
    id: 'participant-id',
    meetingId: 'meeting-id',
    userId: 'member-id',
    role: MeetingParticipantRole.Participant,
    attended: false,
    user: {
      id: 'member-id',
      fullName: 'Nguyen Van A',
      email: 'member@example.com',
      avatarUrl: null,
    },
  } as MeetingParticipant;

  beforeEach(() => {
    meetingParticipantsRepository = {
      createMany: jest.fn(),
      findByIdAndMeeting: jest.fn(),
      findByMeeting: jest.fn(),
      findByMeetingAndUsers: jest.fn(),
      update: jest.fn(),
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
      getUserWorkspaceRole: jest.fn(),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn(),
    };

    meetingAccessService.assertMeetingInProject.mockResolvedValue({} as never);
    meetingParticipantsRepository.createMany.mockResolvedValue([participant]);
    meetingParticipantsRepository.findByMeeting.mockResolvedValue([
      participant,
    ]);
    meetingParticipantsRepository.findByMeetingAndUsers.mockResolvedValue([]);
    meetingParticipantsRepository.findByIdAndMeeting.mockResolvedValue(
      participant,
    );
    meetingParticipantsRepository.update.mockResolvedValue({
      ...participant,
      attended: true,
    });

    service = new MeetingParticipantsService(
      meetingParticipantsRepository as unknown as MeetingParticipantsRepository,
      meetingAccessService as unknown as MeetingAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      projectAccessService as unknown as ProjectAccessService,
    );
  });

  it('adds active workspace members and defaults role to PARTICIPANT', async () => {
    const response = await service.addParticipants(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {
        participants: [{ userId: 'member-id' }],
      },
    );

    expect(
      meetingAccessService.assertUserCanManageMeeting,
    ).toHaveBeenCalledWith('owner-id', 'workspace-id');
    expect(workspaceAccessService.assertWorkspaceMember).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(meetingParticipantsRepository.createMany).toHaveBeenCalledWith([
      {
        meetingId: 'meeting-id',
        userId: 'member-id',
        role: MeetingParticipantRole.Participant,
      },
    ]);
    expect(response.data.items).toHaveLength(1);
  });

  it('rejects duplicate participant in the same meeting', async () => {
    meetingParticipantsRepository.findByMeetingAndUsers.mockResolvedValue([
      participant,
    ]);

    await expect(
      service.addParticipants(
        'owner-id',
        'workspace-id',
        'project-id',
        'meeting-id',
        {
          participants: [{ userId: 'member-id' }],
        },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(meetingParticipantsRepository.createMany).not.toHaveBeenCalled();
  });

  it('allows MEMBER to update only their own attendance', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Member,
    );

    const response = await service.updateAttendance(
      'member-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      'participant-id',
      { attended: true },
    );

    expect(meetingParticipantsRepository.update).toHaveBeenCalledWith(
      participant,
      { attended: true },
    );
    expect(response.data.participant.attended).toBe(true);
  });

  it('rejects VIEWER or another member updating attendance', async () => {
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.Viewer,
    );

    await expect(
      service.updateAttendance(
        'viewer-id',
        'workspace-id',
        'project-id',
        'meeting-id',
        'participant-id',
        { attended: true },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(meetingParticipantsRepository.update).not.toHaveBeenCalled();
  });
});
