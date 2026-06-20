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
import { SprintsController } from '../src/modules/sprints/controllers/sprints.controller';
import { SprintsService } from '../src/modules/sprints/services/sprints.service';

type SprintsE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    sprint?: {
      name?: string;
      status?: string;
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

describe('SprintsController (e2e)', () => {
  let app: INestApplication<App>;
  let sprintsService: jest.Mocked<
    Pick<
      SprintsService,
      | 'cancelSprint'
      | 'completeSprint'
      | 'createSprint'
      | 'getSprintDetail'
      | 'getSprints'
      | 'startSprint'
      | 'updateSprint'
    >
  >;

  const sprintResponse = {
    id: 'sprint-id',
    projectId: 'project-id',
    name: 'Sprint 1',
    goal: 'First sprint goal',
    status: 'PLANNED',
    startDate: '2026-06-14',
    endDate: '2026-06-21',
    startedAt: null,
    completedAt: null,
    createdBy: 'owner-id',
    createdAt: '2026-06-14T00:00:00.000Z',
    updatedAt: '2026-06-14T00:00:00.000Z',
  };

  beforeEach(async () => {
    sprintsService = {
      cancelSprint: jest.fn().mockResolvedValue({
        success: true,
        message: 'Cancel sprint successfully',
        data: null,
      }),
      completeSprint: jest.fn().mockResolvedValue({
        success: true,
        message: 'Complete sprint successfully',
        data: {
          sprint: {
            ...sprintResponse,
            status: 'COMPLETED',
          },
        },
      }),
      createSprint: jest.fn().mockResolvedValue({
        success: true,
        message: 'Create sprint successfully',
        data: {
          sprint: sprintResponse,
        },
      }),
      getSprintDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get sprint detail successfully',
        data: {
          sprint: sprintResponse,
        },
      }),
      getSprints: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get sprints successfully',
        data: {
          items: [sprintResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      }),
      startSprint: jest.fn().mockResolvedValue({
        success: true,
        message: 'Start sprint successfully',
        data: {
          sprint: {
            ...sprintResponse,
            status: 'ACTIVE',
          },
        },
      }),
      updateSprint: jest.fn().mockResolvedValue({
        success: true,
        message: 'Update sprint successfully',
        data: {
          sprint: {
            ...sprintResponse,
            name: 'Updated Sprint',
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SprintsController],
      providers: [
        {
          provide: SprintsService,
          useValue: sprintsService,
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

  it('rejects unauthenticated sprint list request', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/projects/project-id/sprints')
      .expect(401)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects create sprint body with projectId from client', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/sprints')
      .set('Authorization', 'Bearer access-token')
      .send({
        projectId: 'fake-project-id',
        name: 'Sprint 1',
        startDate: '2026-06-14',
        endDate: '2026-06-21',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(body.errors).toContain('property projectId should not exist');
        expect(sprintsService.createSprint).not.toHaveBeenCalled();
      });
  });

  it('creates sprint with valid body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/sprints')
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Sprint 1',
        goal: 'First sprint goal',
        startDate: '2026-06-14',
        endDate: '2026-06-21',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(sprintsService.createSprint).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          {
            name: 'Sprint 1',
            goal: 'First sprint goal',
            startDate: '2026-06-14',
            endDate: '2026-06-21',
          },
        );
        expect(body.data?.sprint?.status).toBe('PLANNED');
      });
  });

  it('gets sprints with query filters', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/sprints?status=PLANNED&page=1&limit=10',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(sprintsService.getSprints).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          {
            status: 'PLANNED',
            page: 1,
            limit: 10,
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets sprint detail', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/sprints/sprint-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(sprintsService.getSprintDetail).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'sprint-id',
        );
      });
  });

  it('rejects update sprint body with status from client', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/sprints/sprint-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Updated Sprint',
        status: 'ACTIVE',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(body.errors).toContain('property status should not exist');
        expect(sprintsService.updateSprint).not.toHaveBeenCalled();
      });
  });

  it('updates sprint with valid body', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/sprints/sprint-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Updated Sprint',
      })
      .expect(200)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(sprintsService.updateSprint).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'sprint-id',
          {
            name: 'Updated Sprint',
          },
        );
        expect(body.data?.sprint?.name).toBe('Updated Sprint');
      });
  });

  it('starts sprint', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/sprints/sprint-id/start',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(sprintsService.startSprint).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'sprint-id',
        );
        expect(body.data?.sprint?.status).toBe('ACTIVE');
      });
  });

  it('completes sprint', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/sprints/sprint-id/complete',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(sprintsService.completeSprint).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'sprint-id',
        );
        expect(body.data?.sprint?.status).toBe('COMPLETED');
      });
  });

  it('cancels sprint', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/sprints/sprint-id/cancel',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as SprintsE2eResponse;

        expect(sprintsService.cancelSprint).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'sprint-id',
        );
        expect(body.data).toBeNull();
      });
  });
});
