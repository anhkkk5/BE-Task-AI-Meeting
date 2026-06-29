import { ForbiddenException, Injectable } from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class AiMeetingSummaryAccessService {
  constructor(
    private readonly meetingParticipantsRepository: MeetingParticipantsRepository,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async assertCanGenerateSummary(userId: string, workspaceId: string) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role || !managerRoles.includes(role)) {
      throw new ForbiddenException('You can not generate meeting summary');
    }

    return role;
  }

  async assertCanViewSummary(
    userId: string,
    workspaceId: string,
    meetingId: string,
  ) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role || role === WorkspaceRole.Viewer) {
      throw new ForbiddenException('You can not view meeting summary');
    }

    if (managerRoles.includes(role)) {
      return role;
    }

    const participant =
      await this.meetingParticipantsRepository.findByMeetingAndUser(
        meetingId,
        userId,
      );

    if (!participant) {
      throw new ForbiddenException('You can not view this meeting summary');
    }

    return role;
  }
}
