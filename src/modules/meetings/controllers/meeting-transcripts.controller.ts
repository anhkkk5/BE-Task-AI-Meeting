import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { AppendLiveTranscriptSegmentDto } from '../dto/append-live-transcript-segment.dto';
import { SaveMeetingTranscriptDto } from '../dto/save-meeting-transcript.dto';
import { MeetingTranscriptsService } from '../services/meeting-transcripts.service';

const meetingManagerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller(
  'workspaces/:workspaceId/projects/:projectId/meetings/:meetingId/transcript',
)
@ApiTags('Meeting Transcripts')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class MeetingTranscriptsController {
  constructor(
    private readonly meetingTranscriptsService: MeetingTranscriptsService,
  ) {}

  @Post()
  @WorkspaceRoles(...meetingManagerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Save meeting transcript' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  saveTranscript(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Body() dto: SaveMeetingTranscriptDto,
  ) {
    return this.meetingTranscriptsService.saveTranscript(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      dto,
    );
  }

  @Post('live-segments')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Append live transcript segment',
    description:
      'User hien tai gui mot doan transcript tu mic cua minh. Backend tu gan speaker theo JWT de AI biet ai noi gi.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  appendLiveSegment(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Body() dto: AppendLiveTranscriptSegmentDto,
  ) {
    return this.meetingTranscriptsService.appendLiveSegment(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      dto,
    );
  }

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get meeting transcript' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  getTranscript(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
  ) {
    return this.meetingTranscriptsService.getTranscript(
      user.id,
      workspaceId,
      projectId,
      meetingId,
    );
  }
}
