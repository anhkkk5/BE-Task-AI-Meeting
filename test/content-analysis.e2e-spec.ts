import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { WorkspaceRolesGuard } from '../src/common/guards/workspace-roles.guard';
import { MeetingImportController } from '../src/modules/ai-assistant/controllers/meeting-import.controller';
import { MeetingImportService } from '../src/modules/ai-assistant/services/meeting-import.service';
import { AccessTokenGuard } from '../src/modules/auth/guards/access-token.guard';

class MockAccessTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string; email: string };
    }>();
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Unauthorized');
    }
    req.user = { id: 'owner-id', email: 'owner@example.com' };
    return true;
  }
}

class AllowGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

describe('MeetingImportController (e2e)', () => {
  let app: INestApplication<App>;
  let service: {
    createJob: jest.Mock;
    getLatestJob: jest.Mock;
    listJobs: jest.Mock;
    getJob: jest.Mock;
  };

  const job = {
    id: 'job-id',
    meetingId: null,
    fileName: 'hop-nhom.txt',
    kind: 'DOCUMENT',
    status: 'QUEUED',
    progress: 5,
  };

  beforeEach(async () => {
    service = {
      createJob: jest.fn().mockImplementation(
        (_userId, _workspaceId, _projectId, file?: Express.Multer.File) => {
          if (!file) throw new BadRequestException('Vui lòng chọn tệp cuộc họp');
          return {
            success: true,
            message: 'Tệp đã được đưa vào hàng đợi xử lý',
            data: { job },
          };
        },
      ),
      getLatestJob: jest.fn().mockResolvedValue({
        success: true,
        message: 'Lấy tiến trình gần nhất thành công',
        data: { job },
      }),
      listJobs: jest.fn().mockResolvedValue({
        success: true,
        message: 'Lấy lịch sử phân tích thành công',
        data: { items: [job] },
      }),
      getJob: jest.fn().mockResolvedValue({
        success: true,
        message: 'Lấy trạng thái xử lý thành công',
        data: { job },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MeetingImportController],
      providers: [{ provide: MeetingImportService, useValue: service }],
    })
      .overrideGuard(AccessTokenGuard)
      .useClass(MockAccessTokenGuard)
      .overrideGuard(WorkspaceRolesGuard)
      .useClass(AllowGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => app.close());

  it('rejects unauthenticated upload with 401', () =>
    request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/ai/content-analysis')
      .attach('file', Buffer.from('Nội dung cuộc họp hợp lệ'), 'hop-nhom.txt')
      .expect(401));

  it('rejects upload without a file with 400', () =>
    request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/ai/content-analysis')
      .set('Authorization', 'Bearer access-token')
      .expect(400)
      .expect(({ body }) => {
        expect(body.success).toBe(false);
        expect(body.message).toBe('Vui lòng chọn tệp cuộc họp');
      }));

  it('queues a valid file with 201 and keeps meetingId null', () =>
    request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/projects/project-id/ai/content-analysis')
      .set('Authorization', 'Bearer access-token')
      .attach(
        'file',
        Buffer.from('Nội dung cuộc họp đủ dài để tóm tắt'),
        'hop-nhom.txt',
      )
      .expect(201)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.data.job.status).toBe('QUEUED');
        expect(body.data.job.meetingId).toBeNull();
        expect(service.createJob).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'project-id',
          expect.objectContaining({ originalname: 'hop-nhom.txt' }),
        );
      }));

  it('returns isolated analysis history with 200', () =>
    request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/projects/project-id/ai/content-analysis')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.items).toHaveLength(1);
        expect(body.data.items[0].meetingId).toBeNull();
      }));
});
