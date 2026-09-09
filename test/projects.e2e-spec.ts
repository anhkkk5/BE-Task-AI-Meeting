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
import { ProjectsController } from '../src/modules/projects/controllers/projects.controller';
import { ProjectsService } from '../src/modules/projects/services/projects.service';

type ProjectsE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    project?: {
      keyCode?: string;
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

describe('ProjectsController (e2e)', () => {
  let app: INestApplication<App>;
  let projectsService: jest.Mocked<
    Pick<
      ProjectsService,
      | 'archiveProject'
      | 'completeProject'
      | 'createProject'
      | 'getProjectDetail'
      | 'getProjects'
      | 'updateProject'
    >
  >;

  const projectResponse = {
    id: 'project-id',
    workspaceId: 'workspace-id',
    name: 'Agile AI',
    keyCode: 'AGILEAI',
    description: 'Project demo',
    status: 'ACTIVE',
    startDate: '2026-06-18',
    endDate: '2026-07-18',
    createdBy: 'owner-id',
    createdAt: '2026-06-18T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
  };

  beforeEach(async () => {
    projectsService = {
      archiveProject: jest.fn().mockResolvedValue({
        success: true,
        message: 'Archive project successfully',
        data: null,
      }),
      completeProject: jest.fn().mockResolvedValue({
        success: true,
        message: 'Complete project successfully',
        data: null,
      }),
      createProject: jest.fn().mockResolvedValue({
        success: true,
        message: 'Create project successfully',
        data: {
          project: projectResponse,
        },
      }),
      getProjectDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get project detail successfully',
        data: {
          project: projectResponse,
        },
      }),
      getProjects: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get projects successfully',
        data: {
          items: [projectResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      }),
      updateProject: jest.fn().mockResolvedValue({
        success: true,
        message: 'Update project successfully',
        data: {
          project: {
            ...projectResponse,
            name: 'Updated Agile AI',
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: projectsService,
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

  it('rejects unauthenticated project list request', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/projects')
      .expect(401)
      .expect((response) => {
        const body = response.body as ProjectsE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects create project body with workspaceId from client', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects')
      .set('Authorization', 'Bearer access-token')
      .send({
        workspaceId: 'fake-workspace-id',
        name: 'Agile AI',
        keyCode: 'AGILEAI',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as ProjectsE2eResponse;

        expect(body.errors).toContain('property workspaceId should not exist');
        expect(projectsService.createProject).not.toHaveBeenCalled();
      });
  });

  it('rejects invalid create project keyCode', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects')
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Agile AI',
        keyCode: 'agile ai',
      })
      .expect(400)
      .expect(() => {
        expect(projectsService.createProject).not.toHaveBeenCalled();
      });
  });

  it('creates project with valid body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects')
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Agile AI',
        description: 'Project demo',
        startDate: '2026-06-18',
        endDate: '2026-07-18',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as ProjectsE2eResponse;

        expect(projectsService.createProject).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          {
            name: 'Agile AI',
            description: 'Project demo',
            startDate: '2026-06-18',
            endDate: '2026-07-18',
          },
        );
        expect(body.data?.project?.keyCode).toBe('AGILEAI');
      });
  });

  it('gets projects with query filters', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects?status=ACTIVE&page=1&limit=10',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as ProjectsE2eResponse;

        expect(projectsService.getProjects).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          {
            status: 'ACTIVE',
            page: 1,
            limit: 10,
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets project detail', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/projects/project-id')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(projectsService.getProjectDetail).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
        );
      });
  });

  it('rejects update project body with keyCode from client', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id/projects/project-id')
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Updated Agile AI',
        keyCode: 'NEWKEY',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as ProjectsE2eResponse;

        expect(body.errors).toContain('property keyCode should not exist');
        expect(projectsService.updateProject).not.toHaveBeenCalled();
      });
  });

  it('updates project with valid body', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id/projects/project-id')
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Updated Agile AI',
        description: 'Updated',
      })
      .expect(200)
      .expect((response) => {
        const body = response.body as ProjectsE2eResponse;

        expect(projectsService.updateProject).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          {
            name: 'Updated Agile AI',
            description: 'Updated',
          },
        );
        expect(body.data?.project?.name).toBe('Updated Agile AI');
      });
  });

  it('archives project', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id/projects/project-id/archive')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as ProjectsE2eResponse;

        expect(projectsService.archiveProject).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
        );
        expect(body.data).toBeNull();
      });
  });

  it('completes project', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id/projects/project-id/complete')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as ProjectsE2eResponse;

        expect(projectsService.completeProject).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
        );
        expect(body.data).toBeNull();
      });
  });
});
