import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { WorkspaceMemberGuard } from '../src/common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../src/common/guards/workspace-roles.guard';
import { AccessTokenGuard } from '../src/modules/auth/guards/access-token.guard';
import { TasksController } from '../src/modules/tasks/controllers/tasks.controller';
import { TasksService } from '../src/modules/tasks/services/tasks.service';

type TasksE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    task?: {
      taskCode?: string;
      title?: string;
      status?: string;
      assigneeId?: string | null;
      sprintId?: string | null;
    };
  } | null;
};

class MockAccessTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string; email: string };
    }>();

    if (!request.headers.authorization) {
      throw new UnauthorizedException('Unauthorized');
    }

    request.user = {
      id: 'owner-id',
      email: 'owner@example.com',
    };

    return true;
  }
}

class AllowGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;
  let tasksService: jest.Mocked<
    Pick<
      TasksService,
      | 'assignTask'
      | 'cancelTask'
      | 'createTask'
      | 'deleteTask'
      | 'getBacklogTasks'
      | 'getSprintTasks'
      | 'getTaskDetail'
      | 'getTasks'
      | 'moveTaskToSprint'
      | 'updateTask'
      | 'updateTaskStatus'
    >
  >;

  const taskResponse = {
    id: 'task-id',
    projectId: 'project-id',
    sprintId: null,
    taskCode: 'AGILEAI-1',
    title: 'Code task API',
    description: 'Build task module',
    status: 'BACKLOG',
    assigneeId: null,
    createdBy: 'owner-id',
    dueDate: '2026-06-25',
    estimatedHours: 6,
    storyPoints: 3,
    createdAt: '2026-06-20T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z',
  };

  beforeEach(async () => {
    tasksService = {
      assignTask: jest.fn().mockResolvedValue({
        success: true,
        message: 'Assign task successfully',
        data: {
          task: {
            ...taskResponse,
            assigneeId: 'member-id',
          },
        },
      }),
      cancelTask: jest.fn().mockResolvedValue({
        success: true,
        message: 'Cancel task successfully',
        data: {
          task: {
            ...taskResponse,
            status: 'CANCELLED',
          },
        },
      }),
      createTask: jest.fn().mockResolvedValue({
        success: true,
        message: 'Create task successfully',
        data: {
          task: taskResponse,
        },
      }),
      deleteTask: jest.fn().mockResolvedValue({
        success: true,
        message: 'Delete task successfully',
        data: null,
      }),
      getBacklogTasks: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get backlog tasks successfully',
        data: {
          items: [taskResponse],
        },
      }),
      getSprintTasks: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get sprint tasks successfully',
        data: {
          items: [
            {
              ...taskResponse,
              sprintId: 'sprint-id',
              status: 'TODO',
            },
          ],
        },
      }),
      getTaskDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get task detail successfully',
        data: {
          task: taskResponse,
        },
      }),
      getTasks: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get tasks successfully',
        data: {
          items: [taskResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      }),
      moveTaskToSprint: jest.fn().mockResolvedValue({
        success: true,
        message: 'Move task sprint successfully',
        data: {
          task: {
            ...taskResponse,
            sprintId: 'sprint-id',
            status: 'TODO',
          },
        },
      }),
      updateTask: jest.fn().mockResolvedValue({
        success: true,
        message: 'Update task successfully',
        data: {
          task: {
            ...taskResponse,
            title: 'Updated task',
          },
        },
      }),
      updateTaskStatus: jest.fn().mockResolvedValue({
        success: true,
        message: 'Update task status successfully',
        data: {
          task: {
            ...taskResponse,
            status: 'IN_PROGRESS',
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: tasksService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useClass(MockAccessTokenGuard)
      .overrideGuard(WorkspaceMemberGuard)
      .useClass(AllowGuard)
      .overrideGuard(WorkspaceRolesGuard)
      .useClass(AllowGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects unauthenticated task list request', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/projects/project-id/tasks')
      .expect(401)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects create task body with projectId, taskCode or status', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/tasks')
      .set('Authorization', 'Bearer access-token')
      .send({
        projectId: 'fake-project-id',
        taskCode: 'ADMIN-999',
        status: 'DONE',
        title: 'Task',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(body.errors).toContain('property projectId should not exist');
        expect(body.errors).toContain('property taskCode should not exist');
        expect(body.errors).toContain('property status should not exist');
        expect(tasksService.createTask).not.toHaveBeenCalled();
      });
  });

  it('creates task with valid body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/tasks')
      .set('Authorization', 'Bearer access-token')
      .send({
        title: 'Code task API',
        description: 'Build task module',
        dueDate: '2026-06-25',
        estimatedHours: 6,
        storyPoints: 3,
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(tasksService.createTask).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          {
            title: 'Code task API',
            description: 'Build task module',
            dueDate: '2026-06-25',
            estimatedHours: 6,
            storyPoints: 3,
          },
        );
        expect(body.data?.task?.taskCode).toBe('AGILEAI-1');
      });
  });

  it('gets tasks with filters', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/tasks?status=TODO&assigneeId=550e8400-e29b-41d4-a716-446655440000&page=1&limit=10',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(tasksService.getTasks).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          {
            status: 'TODO',
            assigneeId: '550e8400-e29b-41d4-a716-446655440000',
            page: 1,
            limit: 10,
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets backlog tasks', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/projects/project-id/tasks/backlog')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(tasksService.getBacklogTasks).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
        );
      });
  });

  it('gets sprint tasks', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/sprints/sprint-id/tasks',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(tasksService.getSprintTasks).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'sprint-id',
        );
      });
  });

  it('rejects update task body with createdBy', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/tasks/task-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        title: 'Updated task',
        createdBy: 'fake-user-id',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(body.errors).toContain('property createdBy should not exist');
        expect(tasksService.updateTask).not.toHaveBeenCalled();
      });
  });

  it('updates task status', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/tasks/task-id/status',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        status: 'IN_PROGRESS',
      })
      .expect(200)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(tasksService.updateTaskStatus).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'task-id',
          {
            status: 'IN_PROGRESS',
          },
        );
        expect(body.data?.task?.status).toBe('IN_PROGRESS');
      });
  });

  it('rejects invalid task status', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/tasks/task-id/status',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        status: 'DOING_NOW',
      })
      .expect(400)
      .expect(() => {
        expect(tasksService.updateTaskStatus).not.toHaveBeenCalled();
      });
  });

  it('assigns task', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/tasks/task-id/assign',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        assigneeId: '550e8400-e29b-41d4-a716-446655440000',
      })
      .expect(200)
      .expect(() => {
        expect(tasksService.assignTask).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'task-id',
          {
            assigneeId: '550e8400-e29b-41d4-a716-446655440000',
          },
        );
      });
  });

  it('moves task to sprint', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/tasks/task-id/sprint',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        sprintId: '550e8400-e29b-41d4-a716-446655440000',
      })
      .expect(200)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(tasksService.moveTaskToSprint).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'task-id',
          {
            sprintId: '550e8400-e29b-41d4-a716-446655440000',
          },
        );
        expect(body.data?.task?.status).toBe('TODO');
      });
  });

  it('cancels task', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/tasks/task-id/cancel',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(tasksService.cancelTask).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'task-id',
        );
        expect(body.data?.task?.status).toBe('CANCELLED');
      });
  });

  it('deletes task', () => {
    return request(app.getHttpServer())
      .delete(
        '/api/v1/workspaces/workspace-id/projects/project-id/tasks/task-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as TasksE2eResponse;

        expect(tasksService.deleteTask).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'task-id',
        );
        expect(body.data).toBeNull();
      });
  });
});
