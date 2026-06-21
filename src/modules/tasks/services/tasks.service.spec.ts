import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { Project } from '../../projects/entities/project.entity';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Task } from '../entities/task.entity';
import { TasksRepository } from '../repositories/tasks.repository';
import { TaskAccessService } from './task-access.service';
import { TaskCodeService } from './task-code.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let tasksRepository: jest.Mocked<
    Pick<
      TasksRepository,
      | 'create'
      | 'findBacklogByProject'
      | 'findByProject'
      | 'findBySprint'
      | 'update'
    >
  >;
  let taskAccessService: jest.Mocked<
    Pick<
      TaskAccessService,
      | 'assertAssignableUser'
      | 'assertSprintCanReceiveTask'
      | 'assertSprintInProject'
      | 'assertTaskEditable'
      | 'assertTaskInProject'
      | 'assertUserCanUpdateTaskStatus'
    >
  >;
  let taskCodeService: jest.Mocked<Pick<TaskCodeService, 'generateTaskCode'>>;
  let workspaceAccessService: jest.Mocked<
    Pick<
      WorkspaceAccessService,
      'assertWorkspaceActive' | 'assertWorkspaceMember'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<
      ProjectAccessService,
      'assertProjectActive' | 'assertProjectInWorkspace'
    >
  >;

  const project = {
    id: 'project-id',
    workspaceId: 'workspace-id',
    keyCode: 'AGILEAI',
  } as Project;

  const task = {
    id: 'task-id',
    projectId: 'project-id',
    sprintId: null,
    taskCode: 'AGILEAI-1',
    title: 'Code task API',
    description: 'Task module',
    status: TaskStatus.Backlog,
    priority: TaskPriority.High,
    assigneeId: 'member-id',
    createdBy: 'owner-id',
    dueDate: '2026-06-25',
    estimatedHours: 6,
    storyPoints: 3,
    createdAt: new Date('2026-06-20T00:00:00.000Z'),
    updatedAt: new Date('2026-06-20T00:00:00.000Z'),
    deletedAt: null,
  } as Task;

  beforeEach(() => {
    tasksRepository = {
      create: jest.fn(),
      findBacklogByProject: jest.fn(),
      findByProject: jest.fn(),
      findBySprint: jest.fn(),
      update: jest.fn(),
    };
    taskAccessService = {
      assertAssignableUser: jest.fn(),
      assertSprintCanReceiveTask: jest.fn(),
      assertSprintInProject: jest.fn(),
      assertTaskEditable: jest.fn(),
      assertTaskInProject: jest.fn(),
      assertUserCanUpdateTaskStatus: jest.fn(),
    };
    taskCodeService = {
      generateTaskCode: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceActive: jest.fn(),
      assertWorkspaceMember: jest.fn(),
    };
    projectAccessService = {
      assertProjectActive: jest.fn(),
      assertProjectInWorkspace: jest.fn(),
    };

    workspaceAccessService.assertWorkspaceMember.mockResolvedValue(
      {} as WorkspaceMember,
    );
    projectAccessService.assertProjectActive.mockResolvedValue(project);
    projectAccessService.assertProjectInWorkspace.mockResolvedValue(project);
    taskCodeService.generateTaskCode.mockResolvedValue('AGILEAI-1');

    service = new TasksService(
      tasksRepository as unknown as TasksRepository,
      taskAccessService as unknown as TaskAccessService,
      taskCodeService as unknown as TaskCodeService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      projectAccessService as unknown as ProjectAccessService,
    );
  });

  it('creates backlog task with generated code', async () => {
    tasksRepository.create.mockResolvedValue(task);

    const response = await service.createTask(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        title: ' Code task API ',
        description: ' Task module ',
        priority: TaskPriority.High,
        assigneeId: 'member-id',
        dueDate: '2026-06-25',
        estimatedHours: 6,
        storyPoints: 3,
      },
    );

    expect(taskCodeService.generateTaskCode).toHaveBeenCalledWith(project);
    expect(taskAccessService.assertAssignableUser).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(tasksRepository.create).toHaveBeenCalledWith({
      projectId: 'project-id',
      sprintId: null,
      taskCode: 'AGILEAI-1',
      title: 'Code task API',
      description: 'Task module',
      status: TaskStatus.Backlog,
      priority: TaskPriority.High,
      assigneeId: 'member-id',
      createdBy: 'owner-id',
      dueDate: '2026-06-25',
      estimatedHours: 6,
      storyPoints: 3,
    });
    expect(response.data.task.status).toBe(TaskStatus.Backlog);
  });

  it('creates sprint task with TODO status', async () => {
    tasksRepository.create.mockResolvedValue({
      ...task,
      sprintId: 'sprint-id',
      status: TaskStatus.Todo,
    });

    const response = await service.createTask(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        title: 'Task in sprint',
        sprintId: 'sprint-id',
      },
    );

    expect(taskAccessService.assertSprintCanReceiveTask).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
    expect(response.data.task.status).toBe(TaskStatus.Todo);
  });

  it('rejects invalid assignee on create', async () => {
    taskAccessService.assertAssignableUser.mockRejectedValue(
      new BadRequestException(
        'Assignee is not an active member of this workspace',
      ),
    );

    await expect(
      service.createTask('owner-id', 'workspace-id', 'project-id', {
        title: 'Task',
        assigneeId: 'missing-user-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tasksRepository.create).not.toHaveBeenCalled();
  });

  it('gets project tasks with sprint filter after access checks', async () => {
    tasksRepository.findByProject.mockResolvedValue({
      items: [task],
      total: 1,
      page: 1,
      limit: 10,
    });

    const response = await service.getTasks(
      'member-id',
      'workspace-id',
      'project-id',
      {
        sprintId: 'sprint-id',
        status: TaskStatus.Todo,
        page: 1,
        limit: 10,
      },
    );

    expect(taskAccessService.assertSprintInProject).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
    expect(response.data.items).toHaveLength(1);
  });

  it('allows assigned member to update task status', async () => {
    taskAccessService.assertTaskInProject.mockResolvedValue(task);
    tasksRepository.update.mockResolvedValue({
      ...task,
      status: TaskStatus.InProgress,
    });

    const response = await service.updateTaskStatus(
      'member-id',
      'workspace-id',
      'project-id',
      'task-id',
      {
        status: TaskStatus.InProgress,
      },
    );

    expect(
      taskAccessService.assertUserCanUpdateTaskStatus,
    ).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
      task,
      TaskStatus.InProgress,
    );
    expect(response.data.task.status).toBe(TaskStatus.InProgress);
  });

  it('does not hide member status permission errors', async () => {
    taskAccessService.assertTaskInProject.mockResolvedValue({
      ...task,
      assigneeId: 'another-member-id',
    });
    taskAccessService.assertUserCanUpdateTaskStatus.mockRejectedValue(
      new ForbiddenException('You can not update this task status'),
    );

    await expect(
      service.updateTaskStatus(
        'member-id',
        'workspace-id',
        'project-id',
        'task-id',
        {
          status: TaskStatus.InProgress,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('moves backlog task into sprint and changes status to TODO', async () => {
    taskAccessService.assertTaskInProject.mockResolvedValue(task);
    tasksRepository.update.mockResolvedValue({
      ...task,
      sprintId: 'sprint-id',
      status: TaskStatus.Todo,
    });

    const response = await service.moveTaskToSprint(
      'owner-id',
      'workspace-id',
      'project-id',
      'task-id',
      {
        sprintId: 'sprint-id',
      },
    );

    expect(taskAccessService.assertSprintCanReceiveTask).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
    expect(response.data.task.status).toBe(TaskStatus.Todo);
  });

  it('moves task back to backlog', async () => {
    taskAccessService.assertTaskInProject.mockResolvedValue({
      ...task,
      sprintId: 'sprint-id',
      status: TaskStatus.InProgress,
    });
    tasksRepository.update.mockResolvedValue({
      ...task,
      sprintId: null,
      status: TaskStatus.Backlog,
    });

    const response = await service.moveTaskToSprint(
      'owner-id',
      'workspace-id',
      'project-id',
      'task-id',
      {
        sprintId: null,
      },
    );

    expect(response.data.task.sprintId).toBeNull();
    expect(response.data.task.status).toBe(TaskStatus.Backlog);
  });

  it('cancels task', async () => {
    taskAccessService.assertTaskInProject.mockResolvedValue(task);
    tasksRepository.update.mockResolvedValue({
      ...task,
      status: TaskStatus.Cancelled,
    });

    const response = await service.cancelTask(
      'owner-id',
      'workspace-id',
      'project-id',
      'task-id',
    );

    expect(response.data.task.status).toBe(TaskStatus.Cancelled);
  });
});
