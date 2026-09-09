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
import { UsersController } from '../src/modules/users/controllers/users.controller';
import { UsersService } from '../src/modules/users/services/users.service';
import { AiUserPreferencesService } from '../src/modules/users/services/ai-user-preferences.service';
import { AvatarUploadService } from '../src/modules/users/services/avatar-upload.service';

type ErrorResponse = {
  success: boolean;
  errors: string[];
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

describe('UsersController validation (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: jest.Mocked<
    Pick<UsersService, 'changePassword' | 'getProfile' | 'updateProfile'>
  >;

  beforeEach(async () => {
    usersService = {
      changePassword: jest.fn().mockResolvedValue({
        success: true,
        message: 'Password changed successfully',
        data: null,
      }),
      getProfile: jest.fn().mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id: 'user-id',
          email: 'member@example.com',
          fullName: 'Nguyen Van A',
        },
      }),
      updateProfile: jest.fn().mockResolvedValue({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: 'user-id',
          email: 'member@example.com',
          fullName: 'Nguyen Van A',
        },
      }),
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: AiUserPreferencesService,
          useValue: {},
        },
        {
          provide: AvatarUploadService,
          useValue: {},
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

  it('rejects profile update without token', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .send({ fullName: 'Nguyen Van A' })
      .expect(401);
  });

  it('rejects invalid profile body before service runs', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer access-token')
      .send({
        fullName: 'A',
        avatarUrl: 'not-url',
        isAdmin: true,
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as ErrorResponse;

        expect(body.errors).toEqual(
          expect.arrayContaining([
            'fullName must be longer than or equal to 2 characters',
            'avatarUrl must be a URL address',
            'property isAdmin should not exist',
          ]),
        );
        expect(usersService.updateProfile).not.toHaveBeenCalled();
      });
  });

  it('accepts valid profile update body', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer access-token')
      .send({
        fullName: 'Nguyen Van A',
        avatarUrl: 'https://example.com/avatar.png',
        phoneNumber: '0900000000',
        jobTitle: 'Backend Developer',
      })
      .expect(200)
      .expect(() => {
        expect(usersService.updateProfile).toHaveBeenCalledWith('user-id', {
          fullName: 'Nguyen Van A',
          avatarUrl: 'https://example.com/avatar.png',
          phoneNumber: '0900000000',
          jobTitle: 'Backend Developer',
        });
      });
  });

  it('rejects invalid change password body before service runs', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/users/me/password')
      .set('Authorization', 'Bearer access-token')
      .send({
        currentPassword: '123',
        newPassword: '456',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as ErrorResponse;

        expect(body.errors).toEqual(
          expect.arrayContaining([
            'currentPassword must be longer than or equal to 8 characters',
            'newPassword must be longer than or equal to 8 characters',
          ]),
        );
        expect(usersService.changePassword).not.toHaveBeenCalled();
      });
  });
});
