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
import { CreateDailyUpdateDto } from '../dto/create-daily-update.dto';
import { GetDailyUpdatesQueryDto } from '../dto/get-daily-updates-query.dto';
import { UpdateDailyUpdateDto } from '../dto/update-daily-update.dto';
import { DailyUpdatesService } from '../services/daily-updates.service';

const dailyUpdateWriterRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
  WorkspaceRole.Member,
];

const dailyUpdateManagerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller('workspaces/:workspaceId/projects/:projectId/daily-updates')
@ApiTags('Daily Updates')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class DailyUpdatesController {
  constructor(private readonly dailyUpdatesService: DailyUpdatesService) {}

  @Post()
  @WorkspaceRoles(...dailyUpdateWriterRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Create daily update',
    description:
      'OWNER, SCRUM_MASTER, PROJECT_MANAGER va MEMBER duoc viet daily update cua chinh minh. VIEWER khong duoc ghi.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({
    status: 201,
    description: 'Create daily update successfully.',
  })
  createDailyUpdate(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateDailyUpdateDto,
  ) {
    return this.dailyUpdatesService.createDailyUpdate(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }

  @Get('me')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get my daily updates',
    description: 'Lay danh sach daily update cua user dang dang nhap.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getMyDailyUpdates(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetDailyUpdatesQueryDto,
  ) {
    return this.dailyUpdatesService.getMyDailyUpdates(
      user.id,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get()
  @WorkspaceRoles(...dailyUpdateManagerRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Get team daily updates',
    description:
      'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc xem daily update cua team.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getTeamDailyUpdates(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetDailyUpdatesQueryDto,
  ) {
    return this.dailyUpdatesService.getTeamDailyUpdates(
      user.id,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get(':dailyUpdateId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get daily update detail',
    description:
      'Creator duoc xem daily update cua minh. OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc xem daily update team.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'dailyUpdateId', example: 'daily-update-uuid' })
  getDailyUpdateDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('dailyUpdateId') dailyUpdateId: string,
  ) {
    return this.dailyUpdatesService.getDailyUpdateDetail(
      user.id,
      workspaceId,
      projectId,
      dailyUpdateId,
    );
  }

  @Patch(':dailyUpdateId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Update my daily update',
    description:
      'Chi nguoi tao daily update duoc cap nhat. Manager khong sua daily update cua nguoi khac.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'dailyUpdateId', example: 'daily-update-uuid' })
  updateDailyUpdate(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('dailyUpdateId') dailyUpdateId: string,
    @Body() dto: UpdateDailyUpdateDto,
  ) {
    return this.dailyUpdatesService.updateDailyUpdate(
      user.id,
      workspaceId,
      projectId,
      dailyUpdateId,
      dto,
    );
  }

  @Patch(':dailyUpdateId/archive')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Archive my daily update',
    description: 'Soft delete daily update bang deletedAt, khong hard delete.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'dailyUpdateId', example: 'daily-update-uuid' })
  archiveDailyUpdate(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('dailyUpdateId') dailyUpdateId: string,
  ) {
    return this.dailyUpdatesService.archiveDailyUpdate(
      user.id,
      workspaceId,
      projectId,
      dailyUpdateId,
    );
  }
}
