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
import { WorkspaceRolesGuard } from '../src/common/guards/workspace-roles.guard';
import { AiTeamReportController } from '../src/modules/ai-assistant/controllers/ai-team-report.controller';
import { AiTeamReportService } from '../src/modules/ai-assistant/services/ai-team-report.service';
import { AccessTokenGuard } from '../src/modules/auth/guards/access-token.guard';

type AiTeamReportsE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    report?: {
      id?: string;
      userId?: string | null;
      reportDate?: string;
      reportType?: string;
      aiOutput?: {
        summary?: string;
      };
    } | null;
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

describe('AiTeamReportController (e2e)', () => {
  let app: INestApplication<App>;
  let aiTeamReportService: jest.Mocked<
    Pick<
      AiTeamReportService,
      | 'generateTeamDailyReport'
      | 'getLatestTeamDailyReport'
      | 'getTeamDailyReportDetail'
      | 'getTeamDailyReports'
    >
  >;

  const sprintId = '550e8400-e29b-41d4-a716-446655440002';
  const reportResponse = {
    id: 'mongo-team-report-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId,
    userId: null,
    reportType: 'TEAM_DAILY_REPORT',
    reportDate: '2026-06-22',
    aiOutput: {
      title: 'Bao cao giao ban nhom',
      summary: 'Mock team summary',
      teamProgress: 'Team dang tien trien on.',
      generatedText: 'Mock generated text',
    },
    model: 'mock-team-report',
    status: 'COMPLETED',
    createdBy: 'owner-id',
    createdAt: '2026-06-22T00:00:00.000Z',
  };

  beforeEach(async () => {
    aiTeamReportService = {
      generateTeamDailyReport: jest.fn().mockResolvedValue({
        success: true,
        message: 'Generate team daily report successfully',
        data: {
          report: reportResponse,
        },
      }),
      getLatestTeamDailyReport: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get latest team daily report successfully',
        data: {
          report: reportResponse,
        },
      }),
      getTeamDailyReportDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get team daily report detail successfully',
        data: {
          report: {
            ...reportResponse,
            inputData: {
              dailyUpdates: [],
              tasks: [],
            },
          },
        },
      }),
      getTeamDailyReports: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get team daily reports successfully',
        data: {
          items: [reportResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AiTeamReportController],
      providers: [
        {
          provide: AiTeamReportService,
          useValue: aiTeamReportService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useClass(MockAccessTokenGuard)
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

  it('rejects unauthenticated team report request', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/team-daily-reports',
      )
      .expect(401)
      .expect((response) => {
        const body = response.body as AiTeamReportsE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects generate body with createdBy from client', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/team-daily-report',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        createdBy: 'fake-user-id',
        reportDate: '2026-06-22',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as AiTeamReportsE2eResponse;

        expect(body.errors).toContain('property createdBy should not exist');
        expect(
          aiTeamReportService.generateTeamDailyReport,
        ).not.toHaveBeenCalled();
      });
  });

  it('rejects generate body with userId from client', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/team-daily-report',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        userId: 'fake-user-id',
        reportDate: '2026-06-22',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as AiTeamReportsE2eResponse;

        expect(body.errors).toContain('property userId should not exist');
      });
  });

  it('generates team daily report', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/team-daily-report',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        reportDate: '2026-06-22',
        sprintId,
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as AiTeamReportsE2eResponse;

        expect(
          aiTeamReportService.generateTeamDailyReport,
        ).toHaveBeenCalledWith('owner-id', 'workspace-id', 'project-id', {
          reportDate: '2026-06-22',
          sprintId,
        });
        expect(body.data?.report?.userId).toBeNull();
        expect(body.data?.report?.reportType).toBe('TEAM_DAILY_REPORT');
      });
  });

  it('gets team daily reports with query', () => {
    return request(app.getHttpServer())
      .get(
        `/api/v1/workspaces/workspace-id/projects/project-id/ai/team-daily-reports?fromDate=2026-06-01&toDate=2026-06-30&sprintId=${sprintId}&page=1&limit=10`,
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as AiTeamReportsE2eResponse;

        expect(aiTeamReportService.getTeamDailyReports).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          {
            fromDate: '2026-06-01',
            toDate: '2026-06-30',
            sprintId,
            page: 1,
            limit: 10,
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets latest team daily report before reportId route', () => {
    return request(app.getHttpServer())
      .get(
        `/api/v1/workspaces/workspace-id/projects/project-id/ai/team-daily-reports/latest?sprintId=${sprintId}`,
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(
          aiTeamReportService.getLatestTeamDailyReport,
        ).toHaveBeenCalledWith('owner-id', 'workspace-id', 'project-id', {
          fromDate: undefined,
          toDate: undefined,
          sprintId,
          page: 1,
          limit: 10,
        });
        expect(
          aiTeamReportService.getTeamDailyReportDetail,
        ).not.toHaveBeenCalled();
      });
  });

  it('gets team report detail', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/team-daily-reports/mongo-team-report-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as AiTeamReportsE2eResponse;

        expect(
          aiTeamReportService.getTeamDailyReportDetail,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'mongo-team-report-id',
        );
        expect(body.data?.report?.reportType).toBe('TEAM_DAILY_REPORT');
      });
  });
});
