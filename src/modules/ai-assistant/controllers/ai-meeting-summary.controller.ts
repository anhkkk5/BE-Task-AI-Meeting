import {
  Body,
  Controller,
  Get,
  Param,
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
import { GenerateMeetingSummaryDto } from '../dto/generate-meeting-summary.dto';
import { GetMeetingSummariesQueryDto } from '../dto/get-meeting-summaries-query.dto';
import { AiMeetingSummaryService } from '../services/ai-meeting-summary.service';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller(
  'workspaces/:workspaceId/projects/:projectId/meetings/:meetingId/ai',
)
@ApiTags('AI Meeting Summaries')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class AiMeetingSummaryController {
  constructor(
    private readonly aiMeetingSummaryService: AiMeetingSummaryService,
  ) {}

  @Post('summary')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Generate AI meeting summary',
    description:
      'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao summary tu transcript meeting.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  @ApiResponse({
    status: 201,
    description: 'Generate meeting summary successfully.',
  })
  generateMeetingSummary(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Body() dto: GenerateMeetingSummaryDto,
  ) {
    return this.aiMeetingSummaryService.generateMeetingSummary(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      dto,
    );
  }

  @Get('summary')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get latest AI meeting summary',
    description:
      'Manager duoc xem. MEMBER chi duoc xem neu la participant cua meeting. VIEWER bi chan.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  getMeetingSummary(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
  ) {
    return this.aiMeetingSummaryService.getMeetingSummary(
      user.id,
      workspaceId,
      projectId,
      meetingId,
    );
  }

  @Get('summaries')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get AI meeting summary history' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  getMeetingSummaries(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Query() query: GetMeetingSummariesQueryDto,
  ) {
    return this.aiMeetingSummaryService.getMeetingSummaries(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      query,
    );
  }
}

@Controller('workspaces/:workspaceId/projects/:projectId/ai/meeting-summaries')
@ApiTags('AI Meeting Summaries')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, WorkspaceMemberGuard)
export class AiMeetingSummaryDetailController {
  constructor(
    private readonly aiMeetingSummaryService: AiMeetingSummaryService,
  ) {}

  @Get(':summaryId')
  @ApiOperation({ summary: 'Get AI meeting summary detail by summary id' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'summaryId', example: 'mongo-summary-id' })
  getMeetingSummaryDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('summaryId') summaryId: string,
  ) {
    return this.aiMeetingSummaryService.getMeetingSummaryDetail(
      user.id,
      workspaceId,
      projectId,
      summaryId,
    );
  }
}
