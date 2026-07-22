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
  ApiQuery,
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
import { GeneratePersonalizedMeetingSummaryDto } from '../dto/generate-personalized-meeting-summary.dto';
import { GetMyMeetingActionItemsQueryDto } from '../dto/get-my-meeting-action-items-query.dto';
import { AiPersonalizedMeetingSummaryService } from '../services/ai-personalized-meeting-summary.service';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller(
  'workspaces/:workspaceId/projects/:projectId/meetings/:meetingId/ai',
)
@ApiTags('AI Personalized Meeting Summaries')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class AiPersonalizedMeetingSummaryController {
  constructor(
    private readonly personalizedMeetingSummaryService: AiPersonalizedMeetingSummaryService,
  ) {}

  @Post('personalized-summary/me')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Generate my personalized meeting summary',
    description:
      'MEMBER chi duoc tao summary cua minh neu la participant. VIEWER bi chan trong service.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  @ApiResponse({
    status: 201,
    description: 'Generate my personalized meeting summary successfully.',
  })
  generateMyPersonalizedMeetingSummary(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Body() dto: GeneratePersonalizedMeetingSummaryDto,
  ) {
    return this.personalizedMeetingSummaryService.generateMyPersonalizedMeetingSummary(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      dto,
    );
  }

  @Post('personalized-summary/member/:memberId')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Generate personalized meeting summary for member',
    description:
      'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao summary cho participant.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  @ApiParam({ name: 'memberId', example: 'member-user-uuid' })
  @ApiResponse({
    status: 201,
    description: 'Generate member personalized meeting summary successfully.',
  })
  generateMemberPersonalizedMeetingSummary(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Param('memberId') memberId: string,
    @Body() dto: GeneratePersonalizedMeetingSummaryDto,
  ) {
    return this.personalizedMeetingSummaryService.generateMemberPersonalizedMeetingSummary(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      memberId,
      dto,
    );
  }

  @Post('personalized-summaries')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Generate personalized meeting summaries for all participants',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  @ApiResponse({
    status: 201,
    description: 'Generate personalized summaries for all participants.',
  })
  generateAllPersonalizedMeetingSummaries(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Body() dto: GeneratePersonalizedMeetingSummaryDto,
  ) {
    return this.personalizedMeetingSummaryService.generateAllPersonalizedMeetingSummaries(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      dto,
    );
  }

  @Get('personalized-summary/me')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get my personalized meeting summary' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  @ApiResponse({
    status: 200,
    description: 'Get my personalized meeting summary successfully.',
  })
  getMyPersonalizedMeetingSummary(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
  ) {
    return this.personalizedMeetingSummaryService.getMyPersonalizedMeetingSummary(
      user.id,
      workspaceId,
      projectId,
      meetingId,
    );
  }

  @Get('personalized-summary/member/:memberId')
  @WorkspaceRoles(...managerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Get member personalized meeting summary' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'meetingId', example: 'meeting-uuid' })
  @ApiParam({ name: 'memberId', example: 'member-user-uuid' })
  @ApiResponse({
    status: 200,
    description: 'Get member personalized meeting summary successfully.',
  })
  getMemberPersonalizedMeetingSummary(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('meetingId') meetingId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.personalizedMeetingSummaryService.getMemberPersonalizedMeetingSummary(
      user.id,
      workspaceId,
      projectId,
      meetingId,
      memberId,
    );
  }
}

@Controller('workspaces/:workspaceId/projects/:projectId/ai')
@ApiTags('AI Personalized Meeting Summaries')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, WorkspaceMemberGuard)
export class AiPersonalizedMeetingSummaryProjectController {
  constructor(
    private readonly personalizedMeetingSummaryService: AiPersonalizedMeetingSummaryService,
  ) {}

  @Get('personalized-meeting-summaries/:summaryId')
  @ApiOperation({ summary: 'Get personalized meeting summary detail' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'summaryId', example: 'mongo-summary-id' })
  @ApiResponse({
    status: 200,
    description: 'Get personalized meeting summary detail successfully.',
  })
  getPersonalizedMeetingSummaryDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('summaryId') summaryId: string,
  ) {
    return this.personalizedMeetingSummaryService.getPersonalizedMeetingSummaryDetail(
      user.id,
      workspaceId,
      projectId,
      summaryId,
    );
  }

  @Get('meeting-action-items/me')
  @ApiOperation({ summary: 'Get my action items from personalized summaries' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiQuery({
    name: 'meetingId',
    required: false,
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
  })
  @ApiQuery({
    name: 'sprintId',
    required: false,
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01002',
  })
  @ApiQuery({ name: 'fromDate', required: false, example: '2026-06-01' })
  @ApiQuery({ name: 'toDate', required: false, example: '2026-06-30' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Get my meeting action items successfully.',
  })
  getMyMeetingActionItems(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetMyMeetingActionItemsQueryDto,
  ) {
    return this.personalizedMeetingSummaryService.getMyMeetingActionItems(
      user.id,
      workspaceId,
      projectId,
      query,
    );
  }
}
