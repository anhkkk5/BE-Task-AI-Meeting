import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
import { TeamReportActionItemSource } from '../../../common/enums/team-report-action-item-status.enum';
import { WorkspaceMemberGuard } from '../../../common/guards/workspace-member.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateTeamReportTaskDto } from '../dto/create-team-report-task.dto';
import { DismissTeamReportActionItemDto } from '../dto/dismiss-team-report-action-item.dto';
import { RequestTeamReportHandoverDto } from '../dto/request-team-report-handover.dto';
import { AiTeamReportActionItemService } from '../services/ai-team-report-action-item.service';

@Controller(
  'workspaces/:workspaceId/projects/:projectId/ai/team-daily-reports/:reportId/action-items',
)
@ApiTags('AI Team Report Action Items')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, WorkspaceMemberGuard)
export class AiTeamReportActionItemController {
  constructor(private readonly service: AiTeamReportActionItemService) {}

  @Get()
  @ApiOperation({
    summary: 'List blockers and recommendations of a team daily report',
    description:
      'Gop vuong mac va de xuat cua bao cao giao ban thanh mot danh sach kem trang thai da xu ly hay chua.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'reportId', example: 'report-object-id' })
  getActionItems(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.service.getActionItems(
      user.id,
      workspaceId,
      projectId,
      reportId,
    );
  }

  @Post('tasks')
  @ApiOperation({
    summary: 'Create a task from a report item',
    description:
      'Chi OWNER, SCRUM_MASTER, PROJECT_MANAGER duoc chot; quyen kiem tra trong service.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'reportId', example: 'report-object-id' })
  @ApiResponse({ status: 201, description: 'Create task successfully.' })
  createTask(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
    @Body() dto: CreateTeamReportTaskDto,
  ) {
    return this.service.createTaskFromActionItem(
      user.id,
      workspaceId,
      projectId,
      reportId,
      dto,
    );
  }

  @Post('handover-requests')
  @ApiOperation({
    summary: 'Request a task handover from a report item',
    description:
      'Ghi nhan de nghi ban giao. Ban giao that van do nguoi dang giu task tu tao.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'reportId', example: 'report-object-id' })
  @ApiResponse({ status: 201, description: 'Request handover successfully.' })
  requestHandover(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
    @Body() dto: RequestTeamReportHandoverDto,
  ) {
    return this.service.requestHandoverFromActionItem(
      user.id,
      workspaceId,
      projectId,
      reportId,
      dto,
    );
  }

  @Delete(':source/:itemIndex')
  @ApiOperation({
    summary: 'Dismiss a report item',
    description: 'Danh dau muc de xuat la khong xu ly, kem ly do neu co.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'reportId', example: 'report-object-id' })
  @ApiParam({ name: 'source', enum: TeamReportActionItemSource })
  @ApiParam({ name: 'itemIndex', example: 0 })
  dismiss(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('reportId') reportId: string,
    @Param('source') source: TeamReportActionItemSource,
    @Param('itemIndex', ParseIntPipe) itemIndex: number,
    @Body() dto: DismissTeamReportActionItemDto,
  ) {
    return this.service.dismissActionItem(
      user.id,
      workspaceId,
      projectId,
      reportId,
      source,
      itemIndex,
      dto,
    );
  }
}
