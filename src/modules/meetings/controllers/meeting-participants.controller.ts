import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { WorkspaceRoles } from '../../../common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMemberGuard } from '../../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../../common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { AddMeetingParticipantsDto } from '../dto/add-meeting-participants.dto';
import { UpdateParticipantAttendanceDto } from '../dto/update-participant-attendance.dto';
import { MeetingParticipantsService } from '../services/meeting-participants.service';

const meetingManagerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller(
  'workspaces/:workspaceId/projects/:projectId/meetings/:meetingId/participants',
)
@ApiTags('Meeting Participants')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class MeetingParticipantsController {
  constructor(
    private readonly meetingParticipantsService: MeetingParticipantsService,
  ) {}

  @Post()
  @WorkspaceRoles(...meetingManagerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Add meeting participants' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  addParticipants(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Body() dto: AddMeetingParticipantsDto,
  ) {
    return this.meetingParticipantsService.addParticipants(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      dto,
    );
  }

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get meeting participants' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  getParticipants(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
  ) {
    return this.meetingParticipantsService.getParticipants(
      user.id,
      workspaceId,
      projectId,
      meetingId,
    );
  }

  @Patch(':participantId/attendance')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Update participant attendance' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  @ApiParam({ name: 'participantId', example: 'participant-uuid' })
  updateAttendance(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Param('participantId') participantId: string,
    @Body() dto: UpdateParticipantAttendanceDto,
  ) {
    return this.meetingParticipantsService.updateAttendance(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      participantId,
      dto,
    );
  }
}
