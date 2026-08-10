import {
  Body,
  Controller,
  Delete,
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
import { CreateProjectDto } from '../dto/create-project.dto';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsService } from '../services/projects.service';

const projectWriteRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller('workspaces/:workspaceId/projects')
@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('workflow-templates') @UseGuards(WorkspaceMemberGuard)
  listWorkflowTemplates(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string) { return this.projectsService.listWorkflowTemplates(user.id, workspaceId); }

  @Post('workflow-templates') @WorkspaceRoles(...projectWriteRoles) @UseGuards(WorkspaceRolesGuard)
  createWorkflowTemplate(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Body() dto: any) { return this.projectsService.createWorkflowTemplate(user.id, workspaceId, dto); }

  @Patch('workflow-templates/:templateId') @WorkspaceRoles(...projectWriteRoles) @UseGuards(WorkspaceRolesGuard)
  updateWorkflowTemplate(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('templateId') templateId: string, @Body() dto: any) { return this.projectsService.updateWorkflowTemplate(user.id, workspaceId, templateId, dto); }

  @Delete('workflow-templates/:templateId') @WorkspaceRoles(...projectWriteRoles) @UseGuards(WorkspaceRolesGuard)
  deleteWorkflowTemplate(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('templateId') templateId: string) { return this.projectsService.deleteWorkflowTemplate(user.id, workspaceId, templateId); }

  @Patch(':projectId/workflow-template/:templateId') @WorkspaceRoles(...projectWriteRoles) @UseGuards(WorkspaceRolesGuard)
  applyWorkflowTemplate(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('templateId') templateId: string) { return this.projectsService.applyWorkflowTemplate(user.id, workspaceId, projectId, templateId); }

  @Post()
  @WorkspaceRoles(...projectWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Create project',
    description: 'OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao project.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiResponse({ status: 201, description: 'Create project successfully.' })
  createProject(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(user.id, workspaceId, dto);
  }

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get workspace projects',
    description: 'Member ACTIVE nao cung xem duoc project trong workspace.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  getProjects(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Query() query: GetProjectsQueryDto,
  ) {
    return this.projectsService.getProjects(user.id, workspaceId, query);
  }

  @Get(':projectId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get project detail',
    description: 'Chi member cua workspace moi xem duoc project detail.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getProjectDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.getProjectDetail(
      user.id,
      workspaceId,
      projectId,
    );
  }

  @Patch(':projectId')
  @WorkspaceRoles(...projectWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Update project',
    description: 'Khong cho sua keyCode/status/workspaceId/createdBy.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  updateProject(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(
      user.id,
      workspaceId,
      projectId,
      dto,
    );
  }

  @Patch(':projectId/archive')
  @WorkspaceRoles(...projectWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Archive project',
    description: 'Archive bang cach set status = ARCHIVED, khong hard delete.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  archiveProject(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.archiveProject(user.id, workspaceId, projectId);
  }

  @Patch(':projectId/complete')
  @WorkspaceRoles(...projectWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Complete project',
    description: 'Danh dau project da hoan thanh.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  completeProject(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.completeProject(
      user.id,
      workspaceId,
      projectId,
    );
  }
}
