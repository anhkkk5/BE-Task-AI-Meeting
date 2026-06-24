import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Meeting } from '../entities/meeting.entity';
import { MeetingsRepository } from '../repositories/meetings.repository';

const meetingManagerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class MeetingAccessService {
  constructor(
    private readonly meetingsRepository: MeetingsRepository,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  getMeetingInProject(meetingId: string, projectId: string) {
    return this.meetingsRepository.findByIdAndProject(meetingId, projectId);
  }

  async assertMeetingInProject(meetingId: string, projectId: string) {
    const meeting = await this.getMeetingInProject(meetingId, projectId);

    if (!meeting) {
      throw new NotFoundException('Meeting not found in this project');
    }

    return meeting;
  }

  assertMeetingEditable(meeting: Meeting) {
    if (
      [MeetingStatus.Cancelled, MeetingStatus.Archived].includes(meeting.status)
    ) {
      throw new BadRequestException(
        'Cancelled or archived meeting can not be updated',
      );
    }
  }

  async assertUserCanManageMeeting(userId: string, workspaceId: string) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role || !meetingManagerRoles.includes(role)) {
      throw new ForbiddenException('You can not manage this meeting');
    }

    return role;
  }

  async assertUserCanViewMeeting(userId: string, workspaceId: string) {
    return this.workspaceAccessService.assertWorkspaceMember(
      userId,
      workspaceId,
    );
  }

  async isMeetingManager(userId: string, workspaceId: string) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    return Boolean(role && meetingManagerRoles.includes(role));
  }
}
