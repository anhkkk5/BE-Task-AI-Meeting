import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { WorkspaceRoles } from '../../../common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMemberGuard } from '../../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../../common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { GetMeetingsQueryDto } from '../dto/get-meetings-query.dto';
import { UpdateMeetingDto } from '../dto/update-meeting.dto';
import { MeetingsService } from '../services/meetings.service';

const meetingManagerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller('workspaces/:workspaceId/projects/:projectId/meetings')
@ApiTags('Meetings')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @WorkspaceRoles(...meetingManagerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Create meeting',
    description: 'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao meeting.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({ status: 201, description: 'Create meeting successfully.' })
  createMeeting(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateMeetingDto,
  ) {
    return this.meetingsService.createMeeting(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get project meetings',
    description: 'Workspace member ACTIVE nao cung xem duoc meeting.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getMeetings(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetMeetingsQueryDto,
  ) {
    return this.meetingsService.getMeetings(
      user.id,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get(':meetingId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get meeting detail' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  getMeetingDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
  ) {
    return this.meetingsService.getMeetingDetail(
      user.id,
      workspaceId,
      projectId,
      meetingId,
    );
  }

  @Patch(':meetingId')
  @WorkspaceRoles(...meetingManagerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Update meeting' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  updateMeeting(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Body() dto: UpdateMeetingDto,
  ) {
    return this.meetingsService.updateMeeting(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      dto,
    );
  }

  @Patch(':meetingId/cancel')
  @WorkspaceRoles(...meetingManagerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Cancel meeting' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  cancelMeeting(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
  ) {
    return this.meetingsService.cancelMeeting(
      user.id,
      workspaceId,
      projectId,
      meetingId,
    );
  }

  @Patch(':meetingId/complete')
  @WorkspaceRoles(...meetingManagerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Complete meeting' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  completeMeeting(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
  ) {
    return this.meetingsService.completeMeeting(
      user.id,
      workspaceId,
      projectId,
      meetingId,
    );
  }
}
