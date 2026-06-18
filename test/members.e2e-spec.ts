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
import { MembersController } from '../src/modules/members/controllers/members.controller';
import { MembersService } from '../src/modules/members/services/members.service';

type MembersE2eResponse = {
  success: boolean;
  errors?: string[];
  data?: {
    items?: unknown[];
    member?: {
      email?: string;
      role?: string;
      status?: string;
    };
    role?: string;
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

describe('MembersController (e2e)', () => {
  let app: INestApplication<App>;
  let membersService: jest.Mocked<
    Pick<
      MembersService,
      | 'addMember'
      | 'changeMemberRole'
      | 'getMembers'
      | 'getMyRole'
      | 'removeMember'
    >
  >;

  const memberResponse = {
    memberId: 'member-id',
    userId: 'member-user-id',
    fullName: 'Nguyen Van A',
    email: 'member@example.com',
    avatarUrl: null,
    role: 'MEMBER',
    status: 'ACTIVE',
    joinedAt: '2026-06-18T00:00:00.000Z',
  };

  beforeEach(async () => {
    membersService = {
      addMember: jest.fn().mockResolvedValue({
        success: true,
        message: 'Add member successfully',
        data: {
          member: memberResponse,
        },
      }),
      changeMemberRole: jest.fn().mockResolvedValue({
        success: true,
        message: 'Change member role successfully',
        data: {
          member: {
            ...memberResponse,
            role: 'PROJECT_MANAGER',
          },
        },
      }),
      getMembers: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get workspace members successfully',
        data: {
          items: [memberResponse],
        },
      }),
      getMyRole: jest.fn().mockResolvedValue({
        success: true,
        message: 'Get my workspace role successfully',
        data: {
          workspaceId: 'workspace-id',
          userId: 'owner-id',
          role: 'OWNER',
          status: 'ACTIVE',
        },
      }),
      removeMember: jest.fn().mockResolvedValue({
        success: true,
        message: 'Remove member successfully',
        data: null,
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: membersService,
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

  it('rejects unauthenticated member list request', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/members')
      .expect(401)
      .expect((response) => {
        const body = response.body as MembersE2eResponse;

        expect(body.success).toBe(false);
      });
  });

  it('gets workspace members', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/members')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as MembersE2eResponse;

        expect(membersService.getMembers).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
        );
        expect(body.data?.items).toHaveLength(1);
      });
  });

  it('rejects add member body with OWNER role', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/members')
      .set('Authorization', 'Bearer access-token')
      .send({
        email: 'member@example.com',
        role: 'OWNER',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as MembersE2eResponse;

        expect(body.errors).toContain('role should not be equal to OWNER');
        expect(membersService.addMember).not.toHaveBeenCalled();
      });
  });

  it('rejects unknown body fields before add member service runs', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/members')
      .set('Authorization', 'Bearer access-token')
      .send({
        email: 'member@example.com',
        role: 'MEMBER',
        status: 'ACTIVE',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as MembersE2eResponse;

        expect(body.errors).toContain('property status should not exist');
        expect(membersService.addMember).not.toHaveBeenCalled();
      });
  });

  it('adds workspace member with valid body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/workspaces/workspace-id/members')
      .set('Authorization', 'Bearer access-token')
      .send({
        email: 'member@example.com',
        role: 'MEMBER',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as MembersE2eResponse;

        expect(membersService.addMember).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          {
            email: 'member@example.com',
            role: 'MEMBER',
          },
        );
        expect(body.data?.member?.email).toBe('member@example.com');
      });
  });

  it('rejects changing member role to OWNER', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id/members/member-id/role')
      .set('Authorization', 'Bearer access-token')
      .send({
        role: 'OWNER',
      })
      .expect(400)
      .expect(() => {
        expect(membersService.changeMemberRole).not.toHaveBeenCalled();
      });
  });

  it('changes member role with valid body', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id/members/member-id/role')
      .set('Authorization', 'Bearer access-token')
      .send({
        role: 'PROJECT_MANAGER',
      })
      .expect(200)
      .expect((response) => {
        const body = response.body as MembersE2eResponse;

        expect(membersService.changeMemberRole).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'member-id',
          {
            role: 'PROJECT_MANAGER',
          },
        );
        expect(body.data?.member?.role).toBe('PROJECT_MANAGER');
      });
  });

  it('soft removes member', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/workspaces/workspace-id/members/member-id/remove')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as MembersE2eResponse;

        expect(membersService.removeMember).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
          'member-id',
        );
        expect(body.data).toBeNull();
      });
  });

  it('gets current user workspace role', () => {
    return request(app.getHttpServer())
      .get('/api/v1/workspaces/workspace-id/members/me')
      .set('Authorization', 'Bearer access-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as MembersE2eResponse;

        expect(membersService.getMyRole).toHaveBeenCalledWith(
          'owner-id',
          'workspace-id',
        );
        expect(body.data?.role).toBe('OWNER');
      });
  });
});
