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
import { MeetingParticipantsController } from '../src/modules/meetings/controllers/meeting-participants.controller';
import { MeetingTranscriptsController } from '../src/modules/meetings/controllers/meeting-transcripts.controller';
import { MeetingsController } from '../src/modules/meetings/controllers/meetings.controller';
import { MeetingParticipantsService } from '../src/modules/meetings/services/meeting-participants.service';
import { MeetingTranscriptsService } from '../src/modules/meetings/services/meeting-transcripts.service';
import { MeetingsService } from '../src/modules/meetings/services/meetings.service';

type MeetingsE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    meeting?: {
      id?: string;
      title?: string;
      status?: string;
      createdBy?: string;
    };
    participant?: {
      attended?: boolean;
    };
    transcript?: {
      rawTranscript?: string;
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

describe('MeetingsController (e2e)', () => {
  let app: INestApplication<App>;
  let meetingsService: jest.Mocked<
    Pick<
      MeetingsService,
      | 'cancelMeeting'
      | 'completeMeeting'
      | 'createMeeting'
      | 'getMeetingDetail'
      | 'getMeetings'
      | 'updateMeeting'
    >
  >;
  let meetingParticipantsService: jest.Mocked<
    Pick<
      MeetingParticipantsService,
      'addParticipants' | 'getParticipants' | 'updateAttendance'
    >
  >;
  let meetingTranscriptsService: jest.Mocked<
    Pick<MeetingTranscriptsService, 'getTranscript' | 'saveTranscript'>
  >;

  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const sprintId = '550e8400-e29b-41d4-a716-446655440002';

  const meetingResponse = {
    id: 'meeting-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId,
    title: 'Sprint Planning',
    description: 'Plan sprint',
    meetingType: 'SPRINT_PLANNING',
    meetingDate: '2026-06-20',
    startTime: '2026-06-20T08:00:00.000Z',
    endTime: '2026-06-20T09:00:00.000Z',
    status: 'SCHEDULED',
    createdBy: 'owner-id',
    participants: [],
    mongoTranscriptId: null,
    createdAt: '2026-06-20T00:00:00.000Z',
    updatedAt: '2026-06-20T00:00:00.000Z',
  };

  beforeEach(async () => {
    meetingsService = {
      cancelMeeting: jest.fn().mockResolvedValue({
        success: true,
        message: 'Cancel meeting successfully',
        data: null,
      }),
      completeMeeting: jest.fn().mockResolvedValue({
        success: true,
        message: 'Complete meeting successfully',
        data: null,
      }),
      createMeeting: jest.fn().mockResolvedValue({
        success: true,
        message: 'Create meeting successfully',
        data: {
          meeting: meetingResponse,
        },
      }),
      getMeetingDetail: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get meeting detail successfully',
        data: {
          meeting: meetingResponse,
        },
      }),
      getMeetings: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get meetings successfully',
        data: {
          items: [meetingResponse],
          meta: {
            total: 1,
            page: 1,
            limit: 20,
          },
        },
      }),
      updateMeeting: jest.fn().mockResolvedValue({
        success: true,
        message: 'Update meeting successfully',
        data: {
          meeting: {
            ...meetingResponse,
            title: 'Updated meeting',
          },
        },
      }),
    };
    meetingParticipantsService = {
      addParticipants: jest.fn().mockResolvedValue({
        success: true,
        message: 'Add meeting participants successfully',
        data: {
          items: [
            {
              participantId: 'participant-id',
              userId,
              fullName: 'Nguyen Van A',
              email: 'member@example.com',
              role: 'PARTICIPANT',
              attended: false,
            },
          ],
        },
      }),
      getParticipants: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get meeting participants successfully',
        data: {
          items: [],
        },
      }),
      updateAttendance: jest.fn().mockResolvedValue({
        success: true,
        message: 'Update participant attendance successfully',
        data: {
          participant: {
            participantId: 'participant-id',
            userId,
            role: 'PARTICIPANT',
            attended: true,
          },
        },
      }),
    };
    meetingTranscriptsService = {
      getTranscript: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get meeting transcript successfully',
        data: {
          transcript: {
            id: 'mongo-id',
            meetingId: 'meeting-id',
            rawTranscript: 'Nguyen Van A: Daily scrum',
          },
        },
      }),
      saveTranscript: jest.fn().mockResolvedValue({
        success: true,
        message: 'Save meeting transcript successfully',
        data: {
          transcript: {
            id: 'mongo-id',
            meetingId: 'meeting-id',
            rawTranscript: 'Nguyen Van A: Daily scrum',
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        MeetingsController,
        MeetingParticipantsController,
        MeetingTranscriptsController,
      ],
      providers: [
        {
          provide: MeetingsService,
          useValue: meetingsService,
        },
        {
          provide: MeetingParticipantsService,
          useValue: meetingParticipantsService,
        },
        {
          provide: MeetingTranscriptsService,
          useValue: meetingTranscriptsService,
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

  it('rejects unauthenticated meeting list request', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/projects/project-id/meetings')
      .expect(401)
      .expect((response) => {
        const body = response.body as MeetingsE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('rejects create body with workspaceId, projectId, createdBy or status', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/meetings')
      .set('Authorization', 'Bearer access-token')
      .send({
        workspaceId: 'fake-workspace-id',
        projectId: 'fake-project-id',
        createdBy: 'fake-user-id',
        status: 'COMPLETED',
        title: 'Sprint Planning',
        meetingDate: '2026-06-20',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as MeetingsE2eResponse;

        expect(body.errors).toContain('property workspaceId should not exist');
        expect(body.errors).toContain('property projectId should not exist');
        expect(body.errors).toContain('property createdBy should not exist');
        expect(body.errors).toContain('property status should not exist');
        expect(meetingsService.createMeeting).not.toHaveBeenCalled();
      });
  });

  it('creates meeting with valid body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/meetings')
      .set('Authorization', 'Bearer access-token')
      .send({
        sprintId,
        title: 'Sprint Planning',
        description: 'Plan sprint',
        meetingType: 'SPRINT_PLANNING',
        meetingDate: '2026-06-20',
        startTime: '2026-06-20T08:00:00.000Z',
        endTime: '2026-06-20T09:00:00.000Z',
        participantIds: [userId],
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as MeetingsE2eResponse;

        expect(meetingsService.createMeeting).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          {
            sprintId,
            title: 'Sprint Planning',
            description: 'Plan sprint',
            meetingType: 'SPRINT_PLANNING',
            meetingDate: '2026-06-20',
            startTime: '2026-06-20T08:00:00.000Z',
            endTime: '2026-06-20T09:00:00.000Z',
            participantIds: [userId],
          },
        );
        expect(body.data?.meeting?.createdBy).toBe('owner-id');
      });
  });

  it('gets meetings with filters', () => {
    return request(app.getHttpServer())
      .get(
        `/api/v1/workspaces/workspace-id/projects/project-id/meetings?status=SCHEDULED&meetingType=DAILY_SCRUM&sprintId=${sprintId}&page=1&limit=20`,
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as MeetingsE2eResponse;

        expect(meetingsService.getMeetings).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          {
            status: 'SCHEDULED',
            meetingType: 'DAILY_SCRUM',
            sprintId,
            page: 1,
            limit: 20,
          },
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('gets meeting detail by meetingId and project params', () => {
    return request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(() => {
        expect(meetingsService.getMeetingDetail).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
        );
      });
  });

  it('rejects update body with protected fields', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        title: 'Updated meeting',
        projectId: 'fake-project-id',
        createdBy: 'fake-user-id',
        mongoTranscriptId: 'mongo-id',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as MeetingsE2eResponse;

        expect(body.errors).toContain('property projectId should not exist');
        expect(body.errors).toContain('property createdBy should not exist');
        expect(body.errors).toContain(
          'property mongoTranscriptId should not exist',
        );
        expect(meetingsService.updateMeeting).not.toHaveBeenCalled();
      });
  });

  it('updates meeting with valid body', () => {
    return request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        title: 'Updated meeting',
      })
      .expect(200)
      .expect((response) => {
        const body = response.body as MeetingsE2eResponse;

        expect(meetingsService.updateMeeting).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
          {
            title: 'Updated meeting',
          },
        );
        expect(body.data?.meeting?.title).toBe('Updated meeting');
      });
  });

  it('cancels and completes meeting without hard delete route', async () => {
    await request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/cancel',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    await request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/complete',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    expect(meetingsService.cancelMeeting).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
    );
    expect(meetingsService.completeMeeting).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
    );
  });

  it('adds meeting participants', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/participants',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        participants: [{ userId, role: 'PARTICIPANT' }],
      })
      .expect(201)
      .expect(() => {
        expect(meetingParticipantsService.addParticipants).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          'meeting-id',
          {
            participants: [{ userId, role: 'PARTICIPANT' }],
          },
        );
      });
  });

  it('gets participants and updates attendance', async () => {
    await request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/participants',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    const attendanceResponse = await request(app.getHttpServer())
      .patch(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/participants/participant-id/attendance',
      )
      .set('Authorization', 'Bearer access-token')
      .send({ attended: true })
      .expect(200);

    const body = attendanceResponse.body as MeetingsE2eResponse;

    expect(meetingParticipantsService.getParticipants).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
    );
    expect(meetingParticipantsService.updateAttendance).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      'participant-id',
      { attended: true },
    );
    expect(body.data?.participant?.attended).toBe(true);
  });

  it('rejects empty transcript body', () => {
    return request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/transcript',
      )
      .set('Authorization', 'Bearer access-token')
      .send({ rawTranscript: '' })
      .expect(400)
      .expect(() => {
        expect(meetingTranscriptsService.saveTranscript).not.toHaveBeenCalled();
      });
  });

  it('saves and gets meeting transcript', async () => {
    const saveResponse = await request(app.getHttpServer())
      .post(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/transcript',
      )
      .set('Authorization', 'Bearer access-token')
      .send({
        rawTranscript: 'Nguyen Van A: Daily scrum',
        speakers: [
          {
            speakerName: 'Nguyen Van A',
            userId,
            text: 'Daily scrum',
          },
        ],
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(
        '/api/v1/workspaces/workspace-id/projects/project-id/meetings/meeting-id/transcript',
      )
      .set('Authorization', 'Bearer access-token')
      .expect(200);

    const body = saveResponse.body as MeetingsE2eResponse;

    expect(meetingTranscriptsService.saveTranscript).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      {
        rawTranscript: 'Nguyen Van A: Daily scrum',
        speakers: [
          {
            speakerName: 'Nguyen Van A',
            userId,
            text: 'Daily scrum',
          },
        ],
      },
    );
    expect(meetingTranscriptsService.getTranscript).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
    );
    expect(body.data?.transcript?.rawTranscript).toBe(
      'Nguyen Van A: Daily scrum',
    );
  });
});
