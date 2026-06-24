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
import { DailyUpdatesController } from '../src/modules/daily-updates/controllers/daily-updates.controller';
import { DailyUpdatesService } from '../src/modules/daily-updates/services/daily-updates.service';

type DailyUpdatesE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    dailyUpdate?: {
      id?: string;
      userId?: string;
      mood?: string | null;
      updateDate?: string;
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
      id: 'member-id',
      email: 'member@example.com',
    };

    return true;
  }
}

class AllowGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

describe('DailyUpdatesController (e2e)', () => {
  let app: INestApplication<App>;
  let dailyUpdatesService: jest.Mocked<
    Pick<
      DailyUpdatesService,
      | 'archiveDailyUpdate'
      | 'createDailyUpdate'
      | 'getDailyUpdateDetail'
      | 'getMyDailyUpdates'
      | 'getTeamDailyUpdates'
      | 'updateDailyUpdate'
    >
  >;

  const dailyUpdateResponse = {
    id: 'daily-update-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    userId: 'member-id',
    user: {
      id: 'member-id',
      fullName: 'Nguyen Van A',
      email: 'member@example.com',
      avatarUrl: null,
    },
    sprint: null,
    updateDate: '2026-06-20',
    yesterdayWork: 'Done task API',
    todayPlan: 'Write tests',
    blockers: null,
    notes: null,
    mood: 'NORMAL',
    createdAt: '2026-06-20T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z',
  };

  beforeEach(async () => {
    dailyUpdatesService = {
      archiveDailyUpdate: jest.fn().mockResolvedValue({
        success: true,
        message: 'Archive daily update successfully',
        data: null,
      }),
      createDailyUpdate: jest.fn().mockResolvedValue({
        success: true,
        message: 'Create daily update successfully',
        data: {
          dailyUpdate: dailyUpdateResponse,
        },
      }),
      getDailyUpdateDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get daily update detail successfully',
        data: {
          dailyUpdate: dailyUpdateResponse,
        },
      }),
      getMyDailyUpdates: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get my daily updates successfully',
        data: {
          items: [dailyUpdateResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 20,
          },
        },
      }),
      getTeamDailyUpdates: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get team daily updates successfully',
        data: {
          items: [dailyUpdateResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 20,
          },
        },
      }),
      updateDailyUpdate: jest.fn().mockResolvedValue({
        success: true,
        message: 'Update daily update successfully',
        data: {
          dailyUpdate: {
            ...dailyUpdateResponse,
            mood: 'GOOD',
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DailyUpdatesController],
      providers: [
        {
          provide: DailyUpdatesService,
          useValue: dailyUpdatesService,
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

  it('rejects unauthenticated my daily updates request', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/daily-updates/me',
      )
      .expect(401)
      .expect((response) => {
        const body = response.body as DailyUpdatesE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects create body with userId, workspaceId or projectId', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/daily-updates')
      .set('Authorization', 'Bearer access-token')
      .send({
        userId: 'fake-user-id',
        workspaceId: 'fake-workspace-id',
        projectId: 'fake-project-id',
        updateDate: '2026-06-20',
        yesterdayWork: 'Done',
        todayPlan: 'Plan',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as DailyUpdatesE2eResponse;

        expect(body.errors).toContain('property userId should not exist');
        expect(body.errors).toContain('property workspaceId should not exist');
        expect(body.errors).toContain('property projectId should not exist');
        expect(dailyUpdatesService.createDailyUpdate).not.toHaveBeenCalled();
      });
  });

  it('creates daily update with valid body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/daily-updates')
      .set('Authorization', 'Bearer access-token')
      .send({
        updateDate: '2026-06-20',
        yesterdayWork: 'Done task API',
        todayPlan: 'Write tests',
        blockers: 'No blocker',
        notes: 'Need review',
        mood: 'NORMAL',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as DailyUpdatesE2eResponse;

        expect(dailyUpdatesService.createDailyUpdate).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          {
            updateDate: '2026-06-20',
            yesterdayWork: 'Done task API',
            todayPlan: 'Write tests',
            blockers: 'No blocker',
            notes: 'Need review',
            mood: 'NORMAL',
          },
        );
        expect(body.data?.dailyUpdate?.userId).toBe('member-id');
      });
  });

  it('rejects invalid mood', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/daily-updates')
      .set('Authorization', 'Bearer access-token')
      .send({
        updateDate: '2026-06-20',
        yesterdayWork: 'Done',
        todayPlan: 'Plan',
        mood: 'SAD',
      })
      .expect(400)
      .expect(() => {
        expect(dailyUpdatesService.createDailyUpdate).not.toHaveBeenCalled();
      });
  });

  it('gets my daily updates with filters', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/daily-updates/me?fromDate=2026-06-01&toDate=2026-06-30&sprintId=550e8400-e29b-41d4-a716-446655440000&page=1&limit=20',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as DailyUpdatesE2eResponse;

        expect(dailyUpdatesService.getMyDailyUpdates).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          {
            fromDate: '2026-06-01',
            toDate: '2026-06-30',
            sprintId: '550e8400-e29b-41d4-a716-446655440000',
            page: 1,
            limit: 20,
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets team daily updates with member filter', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/daily-updates?date=2026-06-20&memberId=550e8400-e29b-41d4-a716-446655440000',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(dailyUpdatesService.getTeamDailyUpdates).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          {
            date: '2026-06-20',
            memberId: '550e8400-e29b-41d4-a716-446655440000',
          },
        );
      });
  });

  it('gets daily update detail', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/daily-updates/daily-update-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(dailyUpdatesService.getDailyUpdateDetail).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          'daily-update-id',
        );
      });
  });

  it('rejects update body with userId or updateDate', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/daily-updates/daily-update-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        userId: 'fake-user-id',
        updateDate: '2026-06-21',
        mood: 'GOOD',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as DailyUpdatesE2eResponse;

        expect(body.errors).toContain('property userId should not exist');
        expect(body.errors).toContain('property updateDate should not exist');
        expect(dailyUpdatesService.updateDailyUpdate).not.toHaveBeenCalled();
      });
  });

  it('updates daily update with valid body', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/daily-updates/daily-update-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        mood: 'GOOD',
      })
      .expect(200)
      .expect((response) => {
        const body = response.body as DailyUpdatesE2eResponse;

        expect(dailyUpdatesService.updateDailyUpdate).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          'daily-update-id',
          {
            mood: 'GOOD',
          },
        );
        expect(body.data?.dailyUpdate?.mood).toBe('GOOD');
      });
  });

  it('archives daily update', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/daily-updates/daily-update-id/archive',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as DailyUpdatesE2eResponse;

        expect(dailyUpdatesService.archiveDailyUpdate).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          'daily-update-id',
        );
        expect(body.data).toBeNull();
      });
  });
});
