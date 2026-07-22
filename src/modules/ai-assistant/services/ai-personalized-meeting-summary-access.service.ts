import { ForbiddenException, Injectable } from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { PersonalizedMeetingSummaryDocument } from '../schemas/personalized-meeting-summary.schema';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class AiPersonalizedMeetingSummaryAccessService {
  constructor(
    private readonly meetingParticipantsRepository: MeetingParticipantsRepository,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async assertCanUseOwnSummary(
    userId: string,
    workspaceId: string,
    meetingId: string,
  ) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role || role === WorkspaceRole.Viewer) {
      throw new ForbiddenException(
        'You can not use personalized meeting summary',
      );
    }

    if (managerRoles.includes(role)) {
      return role;
    }

    await this.assertParticipant(meetingId, userId);
    return role;
  }

  async assertCanManageMemberSummary(userId: string, workspaceId: string) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role || !managerRoles.includes(role)) {
      throw new ForbiddenException(
        'You can not manage member personalized meeting summary',
      );
    }

    return role;
  }

  async assertCanViewSummary(
    currentUserId: string,
    workspaceId: string,
    summary: PersonalizedMeetingSummaryDocument,
  ) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      currentUserId,
      workspaceId,
    );

    if (!role || role === WorkspaceRole.Viewer) {
      throw new ForbiddenException(
        'You can not view personalized meeting summary',
      );
    }

    if (summary.userId === currentUserId) {
      return role;
    }

    if (managerRoles.includes(role)) {
      return role;
    }

    throw new ForbiddenException(
      'You can not view this personalized meeting summary',
    );
  }

  async assertTargetParticipant(meetingId: string, targetUserId: string) {
    return this.assertParticipant(meetingId, targetUserId);
  }

  isManagerRole(role: WorkspaceRole | string | null) {
    return Boolean(role && managerRoles.includes(role as WorkspaceRole));
  }

  private async assertParticipant(meetingId: string, userId: string) {
    const participant =
      await this.meetingParticipantsRepository.findByMeetingAndUser(
        meetingId,
        userId,
      );

    if (!participant) {
      throw new ForbiddenException('User is not a participant of this meeting');
    }

    return participant;
  }
}
