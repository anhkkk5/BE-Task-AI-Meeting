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
import { AiPersonalReportController } from '../src/modules/ai-assistant/controllers/ai-personal-report.controller';
import { AiPersonalReportService } from '../src/modules/ai-assistant/services/ai-personal-report.service';
import { AiDailyReportSchedulerService } from '../src/modules/ai-assistant/schedulers/ai-daily-report-scheduler.service';

type AiReportsE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    report?: {
      id?: string;
      userId?: string;
      reportDate?: string;
      reportType?: string;
      aiOutput?: {
        summary?: string;
      };
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

describe('AiPersonalReportController (e2e)', () => {
  let app: INestApplication<App>;
  let aiPersonalReportService: jest.Mocked<
    Pick<
      AiPersonalReportService,
      | 'generateMemberPersonalDailyReport'
      | 'generateMyPersonalDailyReport'
      | 'getMemberPersonalDailyReports'
      | 'getMyPersonalDailyReports'
      | 'getPersonalDailyReportDetail'
    >
  >;

  const sprintId = '550e8400-e29b-41d4-a716-446655440002';
  const reportResponse = {
    id: 'mongo-report-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId,
    userId: 'member-id',
    reportType: 'PERSONAL_DAILY_REPORT',
    reportDate: '2026-06-20',
    aiOutput: {
      title: 'Bao cao giao ban ca nhan',
      summary: 'Mock summary',
      generatedText: 'Mock generated text',
    },
    model: 'mock-personal-report',
    status: 'COMPLETED',
    createdBy: 'member-id',
    createdAt: '2026-06-20T00:00:00.000Z',
  };

  beforeEach(async () => {
    aiPersonalReportService = {
      generateMemberPersonalDailyReport: jest.fn().mockResolvedValue({
        success: true,
        message: 'Generate member personal daily report successfully',
        data: {
          report: {
            ...reportResponse,
            userId: 'other-member-id',
            createdBy: 'owner-id',
          },
        },
      }),
      generateMyPersonalDailyReport: jest.fn().mockResolvedValue({
        success: true,
        message: 'Generate personal daily report successfully',
        data: {
          report: reportResponse,
        },
      }),
      getMemberPersonalDailyReports: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get member personal daily reports successfully',
        data: {
          items: [reportResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      }),
      getMyPersonalDailyReports: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get my personal daily reports successfully',
        data: {
          items: [reportResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      }),
      getPersonalDailyReportDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get personal daily report detail successfully',
        data: {
          report: {
            ...reportResponse,
            inputData: {
              dailyUpdate: null,
              tasks: [],
            },
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AiPersonalReportController],
      providers: [
        {
          provide: AiPersonalReportService,
          useValue: aiPersonalReportService,
        },
        {
          provide: AiDailyReportSchedulerService,
          useValue: { getAutomationStatus: jest.fn() },
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

  it('rejects unauthenticated my AI reports request', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/personal-daily-reports/me',
      )
      .expect(401)
      .expect((response) => {
        const body = response.body as AiReportsE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects generate body with userId from client', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/personal-daily-report',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        userId: 'fake-user-id',
        reportDate: '2026-06-20',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as AiReportsE2eResponse;

        expect(body.errors).toContain('property userId should not exist');
        expect(
          aiPersonalReportService.generateMyPersonalDailyReport,
        ).not.toHaveBeenCalled();
      });
  });

  it('generates my personal daily report', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/personal-daily-report',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        reportDate: '2026-06-20',
        sprintId,
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as AiReportsE2eResponse;

        expect(
          aiPersonalReportService.generateMyPersonalDailyReport,
        ).toHaveBeenCalledWith('member-id', 'workspace-id', 'project-id', {
          reportDate: '2026-06-20',
          sprintId,
        });
        expect(body.data?.report?.userId).toBe('member-id');
      });
  });

  it('generates member personal daily report through manager endpoint', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/personal-daily-report/member/other-member-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        reportDate: '2026-06-20',
      })
      .expect(201)
      .expect(() => {
        expect(
          aiPersonalReportService.generateMemberPersonalDailyReport,
        ).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          'other-member-id',
          { reportDate: '2026-06-20' },
        );
      });
  });

  it('gets my personal daily reports with query', () => {
    return request(app.getHttpServer())
      .get(
        `/api/v1/workspaces/workspace-id/projects/project-id/ai/personal-daily-reports/me?fromDate=2026-06-01&toDate=2026-06-30&sprintId=${sprintId}&page=1&limit=10`,
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as AiReportsE2eResponse;

        expect(
          aiPersonalReportService.getMyPersonalDailyReports,
        ).toHaveBeenCalledWith('member-id', 'workspace-id', 'project-id', {
          fromDate: '2026-06-01',
          toDate: '2026-06-30',
          sprintId,
          page: 1,
          limit: 10,
        });
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets member personal daily reports', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/personal-daily-reports/member/other-member-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(
          aiPersonalReportService.getMemberPersonalDailyReports,
        ).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          'other-member-id',
          {
            fromDate: undefined,
            toDate: undefined,
            sprintId: undefined,
            page: 1,
            limit: 10,
          },
        );
      });
  });

  it('gets personal report detail', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/personal-daily-reports/mongo-report-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as AiReportsE2eResponse;

        expect(
          aiPersonalReportService.getPersonalDailyReportDetail,
        ).toHaveBeenCalledWith(
          'member-id',
          'workspace-id',
          'project-id',
          'mongo-report-id',
        );
        expect(body.data?.report?.reportType).toBe('PERSONAL_DAILY_REPORT');
      });
  });
});
