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
import { AccessTokenGuard } from '../src/modules/auth/guards/access-token.guard';
import { WorkspacesController } from '../src/modules/workspaces/controllers/workspaces.controller';
import { WorkspacesService } from '../src/modules/workspaces/services/workspaces.service';

type WorkspaceE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    workspace?: {
      myRole?: string;
      name?: string;
      slug?: string;
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
      id: 'user-id',
      email: 'member@example.com',
    };

    return true;
  }
}

describe('WorkspacesController (e2e)', () => {
  let app: INestApplication<App>;
  let workspacesService: jest.Mocked<
    Pick<
      WorkspacesService,
      | 'archiveWorkspace'
      | 'createWorkspace'
      | 'getMyWorkspaces'
      | 'getWorkspaceDetail'
      | 'updateWorkspace'
    >
  >;

  const workspaceResponse = {
    id: 'workspace-id',
    name: 'Nhom Agile AI',
    slug: 'nhom-agile-ai',
    description: 'Workspace demo',
    ownerId: 'user-id',
    plan: 'FREE',
    status: 'ACTIVE',
    createdAt: '2026-06-18T00:00:00.000Z',
  };

  beforeEach(async () => {
    workspacesService = {
      archiveWorkspace: jest.fn().mockResolvedValue({
        success: true,
        message: 'Archive workspace successfully',
        data: null,
      }),
      createWorkspace: jest.fn().mockResolvedValue({
        success: true,
        message: 'Create workspace successfully',
        data: {
          workspace: workspaceResponse,
        },
      }),
      getMyWorkspaces: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get workspaces successfully',
        data: {
          items: [
            {
              ...workspaceResponse,
              role: 'OWNER',
            },
          ],
        },
      }),
      getWorkspaceDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get workspace detail successfully',
        data: {
          workspace: {
            ...workspaceResponse,
            myRole: 'OWNER',
            updatedAt: '2026-06-18T00:00:00.000Z',
          },
        },
      }),
      updateWorkspace: jest.fn().mockResolvedValue({
        success: true,
        message: 'Update workspace successfully',
        data: {
          workspace: {
            ...workspaceResponse,
            name: 'Nhom Agile AI Updated',
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: workspacesService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useClass(MockAccessTokenGuard)
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

  it('rejects unauthenticated workspace creation', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces')
      .send({
        name: 'Nhom Agile AI',
      })
      .expect(401)
      .expect((response) => {
        const body = response.body as WorkspaceE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects ownerId from client body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces')
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Nhom Agile AI',
        ownerId: 'other-user-id',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as WorkspaceE2eResponse;

        expect(body.success).toBe(false);
        expect(body.errors).toContain('property ownerId should not exist');
      });
  });

  it('creates workspace for authenticated user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces')
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Nhom Agile AI',
        description: 'Workspace demo',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as WorkspaceE2eResponse;

        expect(workspacesService.createWorkspace).toHaveBeenCalledWith(
          'user-id',
          {
            name: 'Nhom Agile AI',
            description: 'Workspace demo',
          },
        );
        expect(body.data?.workspace?.slug).toBe('nhom-agile-ai');
      });
  });

  it('gets current user workspaces with status filter', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces?status=ACTIVE')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as WorkspaceE2eResponse;

        expect(workspacesService.getMyWorkspaces).toHaveBeenCalledWith(
          'user-id',
          {
            status: 'ACTIVE',
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets workspace detail', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as WorkspaceE2eResponse;

        expect(workspacesService.getWorkspaceDetail).toHaveBeenCalledWith(
          'user-id',
          'workspace-id',
        );
        expect(body.data?.workspace?.myRole).toBe('OWNER');
      });
  });

  it('updates workspace', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id')
      .set('Authorization', 'Bearer access-token')
      .send({
        name: 'Nhom Agile AI Updated',
        description: 'Updated description',
      })
      .expect(200)
      .expect((response) => {
        const body = response.body as WorkspaceE2eResponse;

        expect(workspacesService.updateWorkspace).toHaveBeenCalledWith(
          'user-id',
          'workspace-id',
          {
            name: 'Nhom Agile AI Updated',
            description: 'Updated description',
          },
        );
        expect(body.data?.workspace?.name).toBe('Nhom Agile AI Updated');
      });
  });

  it('archives workspace', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id/archive')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as WorkspaceE2eResponse;

        expect(workspacesService.archiveWorkspace).toHaveBeenCalledWith(
          'user-id',
          'workspace-id',
        );
        expect(body.data).toBeNull();
      });
  });
});
