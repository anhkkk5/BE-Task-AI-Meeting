import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AddMeetingParticipantsDto } from '../dto/add-meeting-participants.dto';
import { UpdateParticipantAttendanceDto } from '../dto/update-participant-attendance.dto';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingAccessService } from './meeting-access.service';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class MeetingParticipantsService {
  constructor(
    private readonly meetingParticipantsRepository: MeetingParticipantsRepository,
    private readonly meetingAccessService: MeetingAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async addParticipants(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    dto: AddMeetingParticipantsDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.meetingAccessService.assertUserCanManageMeeting(
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
    this.meetingAccessService.assertMeetingEditable(meeting);

    const uniqueParticipants = this.deduplicateParticipants(dto.participants);
    await this.assertParticipantsInWorkspace(
      uniqueParticipants.map((participant) => participant.userId),
      workspaceId,
    );

    const existingParticipants =
      await this.meetingParticipantsRepository.findByMeetingAndUsers(
        meetingId,
        uniqueParticipants.map((participant) => participant.userId),
      );

    if (existingParticipants.length) {
      throw new ConflictException(
        'User is already a participant of this meeting',
      );
    }

    const participants = await this.meetingParticipantsRepository.createMany(
      uniqueParticipants.map((participant) => ({
        meetingId,
        userId: participant.userId,
        role: participant.role ?? MeetingParticipantRole.Participant,
      })),
    );

    return {
      success: true,
      message: 'Add meeting participants successfully',
      data: {
        items: participants.map((participant) =>
          this.toParticipantResponse(participant),
        ),
      },
    };
  }

  async getParticipants(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    await this.meetingAccessService.assertUserCanViewMeeting(
      currentUserId,
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
    const participants =
      await this.meetingParticipantsRepository.findByMeeting(meetingId);

    return {
      success: true,
      message: 'Get meeting participants successfully',
      data: {
        items: participants.map((participant) =>
          this.toParticipantResponse(participant),
        ),
      },
    };
  }

  async updateAttendance(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    participantId: string,
    dto: UpdateParticipantAttendanceDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
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
    const participant = await this.assertParticipantInMeeting(
      participantId,
      meetingId,
    );
    await this.assertCanUpdateAttendance(
      currentUserId,
      workspaceId,
      participant,
    );

    const updatedParticipant = await this.meetingParticipantsRepository.update(
      participant,
      {
        attended: dto.attended,
      },
    );

    return {
      success: true,
      message: 'Update participant attendance successfully',
      data: {
        participant: this.toParticipantResponse(updatedParticipant),
      },
    };
  }

  private async assertParticipantInMeeting(
    participantId: string,
    meetingId: string,
  ) {
    const participant =
      await this.meetingParticipantsRepository.findByIdAndMeeting(
        participantId,
        meetingId,
      );

    if (!participant) {
      throw new NotFoundException('Meeting participant not found');
    }

    return participant;
  }

  private async assertCanUpdateAttendance(
    currentUserId: string,
    workspaceId: string,
    participant: MeetingParticipant,
  ) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      currentUserId,
      workspaceId,
    );

    if (role && managerRoles.includes(role)) {
      return;
    }

    if (role === WorkspaceRole.Member && participant.userId === currentUserId) {
      return;
    }

    throw new ForbiddenException('You can not update this attendance');
  }

  private async assertParticipantsInWorkspace(
    userIds: string[],
    workspaceId: string,
  ) {
    for (const userId of userIds) {
      try {
        await this.workspaceAccessService.assertWorkspaceMember(
          userId,
          workspaceId,
        );
      } catch {
        throw new BadRequestException(
          'Participant is not an active member of this workspace',
        );
      }
    }
  }

  private deduplicateParticipants(
    participants: AddMeetingParticipantsDto['participants'],
  ) {
    const map = new Map<string, (typeof participants)[number]>();

    participants.forEach((participant) => {
      if (!map.has(participant.userId)) {
        map.set(participant.userId, participant);
      }
    });

    return [...map.values()];
  }

  private toParticipantResponse(participant: MeetingParticipant) {
    return {
      participantId: participant.id,
      userId: participant.userId,
      fullName: participant.user?.fullName ?? null,
      email: participant.user?.email ?? null,
      avatarUrl: participant.user?.avatarUrl ?? null,
      role: participant.role,
      attended: participant.attended,
    };
  }
}
