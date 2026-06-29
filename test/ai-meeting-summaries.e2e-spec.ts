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
import {
  AiMeetingSummaryController,
  AiMeetingSummaryDetailController,
} from '../src/modules/ai-assistant/controllers/ai-meeting-summary.controller';
import { AiMeetingSummaryService } from '../src/modules/ai-assistant/services/ai-meeting-summary.service';
import { AccessTokenGuard } from '../src/modules/auth/guards/access-token.guard';

type AiMeetingSummaryE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    summary?: {
      id?: string;
      meetingId?: string;
      summary?: string;
      status?: string;
    };
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
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

describe('AiMeetingSummaryController (e2e)', () => {
  let app: INestApplication<App>;
  let aiMeetingSummaryService: jest.Mocked<
    Pick<
      AiMeetingSummaryService,
      | 'generateMeetingSummary'
      | 'getMeetingSummaries'
      | 'getMeetingSummary'
      | 'getMeetingSummaryDetail'
    >
  >;

  const summaryResponse = {
    id: 'mongo-summary-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    meetingId: 'meeting-id',
    transcriptId: 'mongo-transcript-id',
    title: 'Tom tat meeting',
    summary: 'Meeting summary',
    keyPoints: ['Thong nhat sprint goal'],
    decisions: ['Thong nhat sprint goal'],
    actionItems: [],
    risks: [],
    openQuestions: [],
    nextSteps: [],
    aiOutput: {
      title: 'Tom tat meeting',
      summary: 'Meeting summary',
      keyPoints: ['Thong nhat sprint goal'],
      decisions: ['Thong nhat sprint goal'],
      actionItems: [],
      risks: [],
      openQuestions: [],
      nextSteps: [],
      generatedText: 'Generated meeting summary',
    },
    model: 'mock-meeting-summary',
    status: 'COMPLETED',
    createdBy: 'owner-id',
    createdAt: '2026-06-25T00:00:00.000Z',
  };

  beforeEach(async () => {
    aiMeetingSummaryService = {
      generateMeetingSummary: jest.fn().mockResolvedValue({
        success: true,
        message: 'Generate meeting summary successfully',
        data: {
          summary: summaryResponse,
        },
      }),
      getMeetingSummary: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get meeting summary successfully',
        data: {
          summary: summaryResponse,
        },
      }),
      getMeetingSummaries: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get meeting summaries successfully',
        data: {
          items: [summaryResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      }),
      getMeetingSummaryDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get meeting summary detail successfully',
        data: {
          summary: summaryResponse,
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AiMeetingSummaryController,
        AiMeetingSummaryDetailController,
      ],
      providers: [
        {
          provide: AiMeetingSummaryService,
          useValue: aiMeetingSummaryService,
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

  it('rejects unauthenticated meeting summary request', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/summary',
      )
      .expect(401)
      .expect((response) => {
        const body = response.body as AiMeetingSummaryE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects generate body with protected fields', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/summary',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        createdBy: 'fake-user-id',
        meetingId: 'fake-meeting-id',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as AiMeetingSummaryE2eResponse;

        expect(body.errors).toContain('property createdBy should not exist');
        expect(body.errors).toContain('property meetingId should not exist');
        expect(
          aiMeetingSummaryService.generateMeetingSummary,
        ).not.toHaveBeenCalled();
      });
  });

  it('generates meeting summary', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/summary',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        forceRegenerate: true,
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as AiMeetingSummaryE2eResponse;

        expect(
          aiMeetingSummaryService.generateMeetingSummary,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
          {
            forceRegenerate: true,
          },
        );
        expect(body.data?.summary?.meetingId).toBe('meeting-id');
      });
  });

  it('gets latest meeting summary', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/summary',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as AiMeetingSummaryE2eResponse;

        expect(aiMeetingSummaryService.getMeetingSummary).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
        );
        expect(body.data?.summary?.status).toBe('COMPLETED');
      });
  });

  it('gets meeting summary history with pagination', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/summaries?page=1&limit=10',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as AiMeetingSummaryE2eResponse;

        expect(
          aiMeetingSummaryService.getMeetingSummaries,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
          {
            page: 1,
            limit: 10,
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets meeting summary detail by summary id', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/meeting-summaries/mongo-summary-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as AiMeetingSummaryE2eResponse;

        expect(
          aiMeetingSummaryService.getMeetingSummaryDetail,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'mongo-summary-id',
        );
        expect(body.data?.summary?.summary).toBe('Meeting summary');
      });
  });
});
