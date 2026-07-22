import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { Task } from '../entities/task.entity';
import { TasksRepository } from '../repositories/tasks.repository';

const taskManagerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class TaskAccessService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly sprintAccessService: SprintAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  getTaskInProject(taskId: string, projectId: string) {
    return this.tasksRepository.findByIdAndProject(taskId, projectId);
  }

  async assertTaskInProject(taskId: string, projectId: string) {
    const task = await this.getTaskInProject(taskId, projectId);

    if (!task) {
      throw new NotFoundException('Task not found in this project');
    }

    return task;
  }

  assertTaskEditable(task: Task) {
    if (task.status === TaskStatus.Cancelled) {
      throw new BadRequestException('Cancelled task can not be updated');
    }
  }

  async assertAssignableUser(userId: string, workspaceId: string) {
    try {
      return await this.workspaceAccessService.assertWorkspaceMember(
        userId,
        workspaceId,
      );
    } catch {
      throw new BadRequestException(
        'Assignee is not an active member of this workspace',
      );
    }
  }

  async assertSprintCanReceiveTask(
    sprintId: string,
    projectId: string,
  ): Promise<Sprint> {
    const sprint = await this.assertSprintInProject(sprintId, projectId);

    if (
      [SprintStatus.Completed, SprintStatus.Cancelled].includes(sprint.status)
    ) {
      throw new BadRequestException(
        'Can not add task to completed or cancelled sprint',
      );
    }

    return sprint;
  }

  assertSprintInProject(sprintId: string, projectId: string) {
    return this.sprintAccessService.assertSprintInProject(sprintId, projectId);
  }

  async assertUserCanUpdateTaskStatus(
    userId: string,
    workspaceId: string,
    task: Task,
    nextStatus: TaskStatus,
  ) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    if (taskManagerRoles.includes(role)) {
      return role;
    }

    if (
      role === WorkspaceRole.Member &&
      task.assigneeId === userId &&
      nextStatus !== TaskStatus.Cancelled
    ) {
      return role;
    }

    throw new ForbiddenException('You can not update this task status');
  }

  async assertUserCanDeleteTask(
    userId: string,
    workspaceId: string,
    task: Task,
  ) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    if (taskManagerRoles.includes(role) || task.createdBy === userId) {
      return role;
    }

    throw new ForbiddenException('You cannot delete this task');
  }
}
