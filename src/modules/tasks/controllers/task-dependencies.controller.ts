import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { WorkspaceRoles } from '../../../common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMemberGuard } from '../../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../../common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateTaskDependencyDto } from '../dto/create-task-dependency.dto';
import { TaskDependenciesService } from '../services/task-dependencies.service';

const managerRoles = [WorkspaceRole.Owner, WorkspaceRole.ScrumMaster, WorkspaceRole.ProjectManager];

@Controller('workspaces/:workspaceId/projects/:projectId/tasks/:taskId/dependencies')
@UseGuards(AccessTokenGuard)
export class TaskDependenciesController {
  constructor(private readonly service: TaskDependenciesService) {}
  @Get() @UseGuards(WorkspaceMemberGuard)
  list(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('taskId') taskId: string) {
    return this.service.list(user.id, workspaceId, projectId, taskId);
  }
  @Post() @WorkspaceRoles(...managerRoles) @UseGuards(WorkspaceRolesGuard)
  create(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('taskId') taskId: string, @Body() dto: CreateTaskDependencyDto) {
    return this.service.create(user.id, workspaceId, projectId, taskId, dto);
  }
  @Delete(':dependencyId') @WorkspaceRoles(...managerRoles) @UseGuards(WorkspaceRolesGuard)
  remove(@CurrentUser() user: AuthUser, @Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string, @Param('taskId') taskId: string, @Param('dependencyId') dependencyId: string) {
    return this.service.remove(user.id, workspaceId, projectId, taskId, dependencyId);
  }
}
