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
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { GetSprintsQueryDto } from '../dto/get-sprints-query.dto';
import { UpdateSprintDto } from '../dto/update-sprint.dto';
import { SprintsService } from '../services/sprints.service';

const sprintWriteRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller('workspaces/:workspaceId/projects/:projectId/sprints')
@ApiTags('Sprints')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  @WorkspaceRoles(...sprintWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Create sprint',
    description: 'OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao sprint.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({ status: 201, description: 'Create sprint successfully.' })
  createSprint(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.sprintsService.createSprint(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get project sprints',
    description: 'Member ACTIVE nao cung xem duoc sprint trong project.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getSprints(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetSprintsQueryDto,
  ) {
    return this.sprintsService.getSprints(
      user.id,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get(':sprintId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get sprint detail',
    description: 'Chi member cua workspace moi xem duoc sprint detail.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'sprintId', example: 'sprint-uuid' })
  getSprintDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintsService.getSprintDetail(
      user.id,
      workspaceId,
      projectId,
      sprintId,
    );
  }

  @Patch(':sprintId')
  @WorkspaceRoles(...sprintWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Update sprint',
    description: 'Chi update sprint khi status = PLANNED.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'sprintId', example: 'sprint-uuid' })
  updateSprint(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.sprintsService.updateSprint(
      user.id,
      workspaceId,
      projectId,
      sprintId,
      dto,
    );
  }

  @Patch(':sprintId/start')
  @WorkspaceRoles(...sprintWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Start sprint',
    description: 'Chi project chua co sprint ACTIVE moi duoc start.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'sprintId', example: 'sprint-uuid' })
  startSprint(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintsService.startSprint(
      user.id,
      workspaceId,
      projectId,
      sprintId,
    );
  }

  @Patch(':sprintId/complete')
  @WorkspaceRoles(...sprintWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Complete sprint',
    description: 'Chi sprint ACTIVE moi duoc complete.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'sprintId', example: 'sprint-uuid' })
  completeSprint(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintsService.completeSprint(
      user.id,
      workspaceId,
      projectId,
      sprintId,
    );
  }

  @Patch(':sprintId/cancel')
  @WorkspaceRoles(...sprintWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Cancel sprint',
    description: 'Chi sprint PLANNED hoac ACTIVE moi duoc cancel.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'sprintId', example: 'sprint-uuid' })
  cancelSprint(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintsService.cancelSprint(
      user.id,
      workspaceId,
      projectId,
      sprintId,
    );
  }
}
