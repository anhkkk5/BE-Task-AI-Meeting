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
import { AssignTaskDto } from '../dto/assign-task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import { MoveTaskSprintDto } from '../dto/move-task-sprint.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksService } from '../services/tasks.service';

const taskWriteRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Controller('workspaces/:workspaceId/projects/:projectId')
@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('tasks')
  @WorkspaceRoles(...taskWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Create task',
    description:
      'OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao task trong project.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiResponse({ status: 201, description: 'Create task successfully.' })
  createTask(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(user.id, workspaceId, projectId, dto);
  }

  @Get('tasks')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Get project tasks',
    description:
      'Tat ca member ACTIVE trong workspace deu xem duoc task cua project.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getTasks(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query() query: GetTasksQueryDto,
  ) {
    return this.tasksService.getTasks(user.id, workspaceId, projectId, query);
  }

  @Get('tasks/backlog')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get backlog tasks' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  getBacklogTasks(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.getBacklogTasks(user.id, workspaceId, projectId);
  }

  @Get('sprints/:sprintId/tasks')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get sprint tasks' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'sprintId', example: 'sprint-uuid' })
  getSprintTasks(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.tasksService.getSprintTasks(
      user.id,
      workspaceId,
      projectId,
      sprintId,
    );
  }

  @Get('tasks/:taskId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get task detail' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'taskId', example: 'task-uuid' })
  getTaskDetail(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.getTaskDetail(
      user.id,
      workspaceId,
      projectId,
      taskId,
    );
  }

  @Patch('tasks/:taskId')
  @WorkspaceRoles(...taskWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({
    summary: 'Update task',
    description:
      'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc cap nhat thong tin task.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'taskId', example: 'task-uuid' })
  updateTask(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(
      user.id,
      workspaceId,
      projectId,
      taskId,
      dto,
    );
  }

  @Patch('tasks/:taskId/status')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({
    summary: 'Update task status',
    description:
      'Manager role duoc doi status moi task. MEMBER chi doi task duoc gan cho minh.',
  })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'taskId', example: 'task-uuid' })
  updateTaskStatus(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(
      user.id,
      workspaceId,
      projectId,
      taskId,
      dto,
    );
  }

  @Patch('tasks/:taskId/assign')
  @WorkspaceRoles(...taskWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Assign task' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'taskId', example: 'task-uuid' })
  assignTask(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: AssignTaskDto,
  ) {
    return this.tasksService.assignTask(
      user.id,
      workspaceId,
      projectId,
      taskId,
      dto,
    );
  }

  @Patch('tasks/:taskId/sprint')
  @WorkspaceRoles(...taskWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Move task to sprint or backlog' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'taskId', example: 'task-uuid' })
  moveTaskToSprint(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskSprintDto,
  ) {
    return this.tasksService.moveTaskToSprint(
      user.id,
      workspaceId,
      projectId,
      taskId,
      dto,
    );
  }

  @Patch('tasks/:taskId/cancel')
  @WorkspaceRoles(...taskWriteRoles)
  @UseGuards(WorkspaceRolesGuard)
  @ApiOperation({ summary: 'Cancel task' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-uuid' })
  @ApiParam({ name: 'projectId', example: 'project-uuid' })
  @ApiParam({ name: 'taskId', example: 'task-uuid' })
  cancelTask(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.cancelTask(
      user.id,
      workspaceId,
      projectId,
      taskId,
    );
  }
}
