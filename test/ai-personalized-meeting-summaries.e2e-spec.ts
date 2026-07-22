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
  AiPersonalizedMeetingSummaryController,
  AiPersonalizedMeetingSummaryProjectController,
} from '../src/modules/ai-assistant/controllers/ai-personalized-meeting-summary.controller';
import { AiPersonalizedMeetingSummaryService } from '../src/modules/ai-assistant/services/ai-personalized-meeting-summary.service';
import { AccessTokenGuard } from '../src/modules/auth/guards/access-token.guard';

type PersonalizedMeetingSummaryE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    summary?: {
      id?: string;
      meetingId?: string;
      userId?: string;
      personalSummary?: string;
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

describe('AiPersonalizedMeetingSummaryController (e2e)', () => {
  let app: INestApplication<App>;
  let personalizedMeetingSummaryService: jest.Mocked<
    Pick<
      AiPersonalizedMeetingSummaryService,
      | 'generateAllPersonalizedMeetingSummaries'
      | 'generateMemberPersonalizedMeetingSummary'
      | 'generateMyPersonalizedMeetingSummary'
      | 'getMemberPersonalizedMeetingSummary'
      | 'getMyMeetingActionItems'
      | 'getMyPersonalizedMeetingSummary'
      | 'getPersonalizedMeetingSummaryDetail'
    >
  >;

  const summaryResponse = {
    id: 'personalized-summary-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    meetingId: 'meeting-id',
    userId: 'member-id',
    sourceSummaryId: 'meeting-summary-id',
    transcriptId: 'transcript-id',
    personalSummary: 'Nguyen Van B can lam API.',
    aiOutput: {
      title: 'Tom tat ca nhan hoa - Nguyen Van B',
      personalSummary: 'Nguyen Van B can lam API.',
      relevantDecisions: ['Nguyen Van B thong nhat lam API'],
      myActionItems: [
        {
          title: 'Nguyen Van B: Em se tao API',
          assigneeId: null,
          assigneeName: 'Nguyen Van B',
          deadline: null,
          source: 'Nguyen Van B: Em se tao API',
        },
      ],
      mentions: ['Nguyen Van B: Em se tao API'],
      risks: [],
      nextSteps: ['Nguyen Van B: Em se tao API'],
      generatedText: 'Generated personalized summary',
    },
    model: 'mock-personalized-meeting-summary',
    status: 'COMPLETED',
    createdBy: 'owner-id',
    createdAt: '2026-06-25T00:00:00.000Z',
  };

  beforeEach(async () => {
    personalizedMeetingSummaryService = {
      generateMyPersonalizedMeetingSummary: jest.fn().mockResolvedValue({
        success: true,
        message: 'Generate my personalized meeting summary successfully',
        data: {
          summary: summaryResponse,
        },
      }),
      generateMemberPersonalizedMeetingSummary: jest.fn().mockResolvedValue({
        success: true,
        message: 'Generate member personalized meeting summary successfully',
        data: {
          summary: summaryResponse,
        },
      }),
      generateAllPersonalizedMeetingSummaries: jest.fn().mockResolvedValue({
        success: true,
        message: 'Generate all personalized meeting summaries successfully',
        data: {
          items: [summaryResponse],
          meta: {
            total: 1,
          },
        },
      }),
      getMyPersonalizedMeetingSummary: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get my personalized meeting summary successfully',
        data: {
          summary: summaryResponse,
        },
      }),
      getMemberPersonalizedMeetingSummary: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get member personalized meeting summary successfully',
        data: {
          summary: summaryResponse,
        },
      }),
      getPersonalizedMeetingSummaryDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get personalized meeting summary detail successfully',
        data: {
          summary: summaryResponse,
        },
      }),
      getMyMeetingActionItems: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get my meeting action items successfully',
        data: {
          items: summaryResponse.aiOutput.myActionItems,
          meta: {
            total: 1,
            page: 1,
            limit: 20,
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AiPersonalizedMeetingSummaryController,
        AiPersonalizedMeetingSummaryProjectController,
      ],
      providers: [
        {
          provide: AiPersonalizedMeetingSummaryService,
          useValue: personalizedMeetingSummaryService,
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

  it('rejects unauthenticated personalized summary request', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/personalized-summary/me',
      )
      .expect(401)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects generate body with protected fields', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/personalized-summary/me',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        createdBy: 'fake-user-id',
        meetingId: 'fake-meeting-id',
        userId: 'fake-member-id',
        workspaceId: 'fake-workspace-id',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(body.errors).toContain('property createdBy should not exist');
        expect(body.errors).toContain('property meetingId should not exist');
        expect(body.errors).toContain('property userId should not exist');
        expect(body.errors).toContain('property workspaceId should not exist');
        expect(
          personalizedMeetingSummaryService.generateMyPersonalizedMeetingSummary,
        ).not.toHaveBeenCalled();
      });
  });

  it('generates my personalized meeting summary', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/personalized-summary/me',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        forceRegenerate: true,
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(
          personalizedMeetingSummaryService.generateMyPersonalizedMeetingSummary,
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

  it('generates member personalized meeting summary', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/personalized-summary/member/member-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        forceRegenerate: true,
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(
          personalizedMeetingSummaryService.generateMemberPersonalizedMeetingSummary,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
          'member-id',
          {
            forceRegenerate: true,
          },
        );
        expect(body.data?.summary?.userId).toBe('member-id');
      });
  });

  it('generates all participant personalized summaries', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/personalized-summaries',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        forceRegenerate: false,
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(
          personalizedMeetingSummaryService.generateAllPersonalizedMeetingSummaries,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
          {
            forceRegenerate: false,
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets my personalized meeting summary', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/personalized-summary/me',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(
          personalizedMeetingSummaryService.getMyPersonalizedMeetingSummary,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
        );
        expect(body.data?.summary?.personalSummary).toBe(
          'Nguyen Van B can lam API.',
        );
      });
  });

  it('gets member personalized meeting summary', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/ai/personalized-summary/member/member-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(
          personalizedMeetingSummaryService.getMemberPersonalizedMeetingSummary,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
          'member-id',
        );
        expect(body.data?.summary?.status).toBe('COMPLETED');
      });
  });

  it('gets personalized meeting summary detail by summary id', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/personalized-meeting-summaries/personalized-summary-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(
          personalizedMeetingSummaryService.getPersonalizedMeetingSummaryDetail,
        ).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'personalized-summary-id',
        );
        expect(body.data?.summary?.id).toBe('personalized-summary-id');
      });
  });

  it('gets my meeting action items with filters', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/ai/meeting-action-items/me?meetingId=9d38e4c2-0d77-4d6c-9127-b06b66d01001&page=1&limit=20',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as PersonalizedMeetingSummaryE2eResponse;

        expect(
          personalizedMeetingSummaryService.getMyMeetingActionItems,
        ).toHaveBeenCalledWith('owner-id', 'workspace-id', 'project-id', {
          meetingId: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
          page: 1,
          limit: 20,
        });
        expect(body.data?.meta?.total).toBe(1);
      });
  });
});
