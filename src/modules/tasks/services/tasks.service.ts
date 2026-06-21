import { BadRequestException, Injectable } from '@nestjs/common';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import { MoveTaskSprintDto } from '../dto/move-task-sprint.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../entities/task.entity';
import { TasksRepository } from '../repositories/tasks.repository';
import { TaskAccessService } from './task-access.service';
import { TaskCodeService } from './task-code.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly taskAccessService: TaskAccessService,
    private readonly taskCodeService: TaskCodeService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async createTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: CreateTaskDto,
  ) {
    const project = await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );

    if (dto.sprintId) {
      await this.taskAccessService.assertSprintCanReceiveTask(
        dto.sprintId,
        projectId,
      );
    }

    if (dto.assigneeId) {
      await this.taskAccessService.assertAssignableUser(
        dto.assigneeId,
        workspaceId,
      );
    }

    const taskCode = await this.taskCodeService.generateTaskCode(project);
    const task = await this.tasksRepository.create({
      projectId,
      sprintId: dto.sprintId ?? null,
      taskCode,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      status: dto.sprintId ? TaskStatus.Todo : TaskStatus.Backlog,
      priority: dto.priority ?? TaskPriority.Medium,
      assigneeId: dto.assigneeId ?? null,
      createdBy: currentUserId,
      dueDate: dto.dueDate ?? null,
      estimatedHours: dto.estimatedHours ?? null,
      storyPoints: dto.storyPoints ?? null,
    });

    return {
      success: true,
      message: 'Create task successfully',
      data: {
        task: this.toTaskResponse(task),
      },
    };
  }

  async getTasks(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetTasksQueryDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );

    if (query.sprintId) {
      await this.taskAccessService.assertSprintInProject(
        query.sprintId,
        projectId,
      );
    }

    const result = await this.tasksRepository.findByProject(projectId, query);

    return {
      success: true,
      message: 'Get tasks successfully',
      data: {
        items: result.items.map((task) => this.toTaskResponse(task)),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      },
    };
  }

  async getBacklogTasks(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const items = await this.tasksRepository.findBacklogByProject(projectId);

    return {
      success: true,
      message: 'Get backlog tasks successfully',
      data: {
        items: items.map((task) => this.toTaskResponse(task)),
      },
    };
  }

  async getSprintTasks(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.taskAccessService.assertSprintInProject(sprintId, projectId);
    const items = await this.tasksRepository.findBySprint(projectId, sprintId);

    return {
      success: true,
      message: 'Get sprint tasks successfully',
      data: {
        items: items.map((task) => this.toTaskResponse(task)),
      },
    };
  }

  async getTaskDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );

    return {
      success: true,
      message: 'Get task detail successfully',
      data: {
        task: this.toTaskResponse(task),
      },
    };
  }

  async updateTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);

    const updatedTask = await this.tasksRepository.update(task, {
      title: dto.title?.trim() ?? task.title,
      description:
        dto.description === undefined
          ? task.description
          : dto.description.trim() || null,
      priority: dto.priority ?? task.priority,
      dueDate: dto.dueDate ?? task.dueDate,
      estimatedHours: dto.estimatedHours ?? task.estimatedHours,
      storyPoints: dto.storyPoints ?? task.storyPoints,
    });

    return {
      success: true,
      message: 'Update task successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async updateTaskStatus(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskStatusDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);
    await this.taskAccessService.assertUserCanUpdateTaskStatus(
      currentUserId,
      workspaceId,
      task,
      dto.status,
    );
    this.assertBacklogStatusMatchesTaskLocation(task, dto.status);

    const updatedTask = await this.tasksRepository.update(task, {
      status: dto.status,
    });

    return {
      success: true,
      message: 'Update task status successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async assignTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: AssignTaskDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);

    if (dto.assigneeId) {
      await this.taskAccessService.assertAssignableUser(
        dto.assigneeId,
        workspaceId,
      );
    }

    const updatedTask = await this.tasksRepository.update(task, {
      assigneeId: dto.assigneeId,
    });

    return {
      success: true,
      message: 'Assign task successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async moveTaskToSprint(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: MoveTaskSprintDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);

    if (dto.sprintId) {
      await this.taskAccessService.assertSprintCanReceiveTask(
        dto.sprintId,
        projectId,
      );
    }

    const updatedTask = await this.tasksRepository.update(task, {
      sprintId: dto.sprintId,
      status: dto.sprintId
        ? task.status === TaskStatus.Backlog
          ? TaskStatus.Todo
          : task.status
        : TaskStatus.Backlog,
    });

    return {
      success: true,
      message: 'Move task sprint successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async cancelTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);

    const updatedTask = await this.tasksRepository.update(task, {
      status: TaskStatus.Cancelled,
    });

    return {
      success: true,
      message: 'Cancel task successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  private async assertWritableProject(workspaceId: string, projectId: string) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    return this.projectAccessService.assertProjectActive(
      projectId,
      workspaceId,
    );
  }

  private assertBacklogStatusMatchesTaskLocation(
    task: Task,
    nextStatus: TaskStatus,
  ) {
    if (nextStatus === TaskStatus.Backlog && task.sprintId) {
      throw new BadRequestException(
        'Move task to backlog before setting BACKLOG status',
      );
    }
  }

  private toTaskResponse(task: Task) {
    return {
      id: task.id,
      projectId: task.projectId,
      sprintId: task.sprintId,
      taskCode: task.taskCode,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            fullName: task.assignee.fullName,
            email: task.assignee.email,
            avatarUrl: task.assignee.avatarUrl,
          }
        : null,
      createdBy: task.createdBy,
      creator: task.creator
        ? {
            id: task.creator.id,
            fullName: task.creator.fullName,
            email: task.creator.email,
          }
        : null,
      sprint: task.sprint
        ? {
            id: task.sprint.id,
            name: task.sprint.name,
            status: task.sprint.status,
          }
        : null,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      storyPoints: task.storyPoints,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
