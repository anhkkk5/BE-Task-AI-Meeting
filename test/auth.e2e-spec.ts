import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AuthController } from '../src/modules/auth/controllers/auth.controller';
import { AuthService } from '../src/modules/auth/services/auth.service';

type ErrorResponse = {
  success: boolean;
  errors: string[];
};

describe('AuthController validation (e2e)', () => {
  let app: INestApplication<App>;
  let authService: jest.Mocked<Pick<AuthService, 'login' | 'register'>>;

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockResolvedValue({
        success: true,
        message: 'Login successfully',
        data: {
          user: {
            id: 'user-id',
            email: 'member@example.com',
            fullName: 'Nguyen Van A',
          },
          tokens: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          },
        },
      }),
      register: jest.fn().mockResolvedValue({
        success: true,
        message: 'Register successfully',
        data: {
          user: {
            id: 'user-id',
            email: 'member@example.com',
            fullName: 'Nguyen Van A',
          },
          tokens: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          },
        },
      }),
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

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

  it('rejects register body with invalid email and short password', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'not-email',
        fullName: 'A',
        password: '123',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as ErrorResponse;

        expect(body.success).toBe(false);
        expect(body.errors).toEqual(
          expect.arrayContaining([
            'email must be an email',
            'fullName must be longer than or equal to 2 characters',
            'password must be longer than or equal to 8 characters',
          ]),
        );
        expect(authService.register).not.toHaveBeenCalled();
      });
  });

  it('rejects extra fields before register service runs', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'member@example.com',
        fullName: 'Nguyen Van A',
        password: 'password123',
        role: 'OWNER',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as ErrorResponse;

        expect(body.errors).toContain('property role should not exist');
        expect(authService.register).not.toHaveBeenCalled();
      });
  });

  it('accepts valid register body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'member@example.com',
        fullName: 'Nguyen Van A',
        password: 'password123',
      })
      .expect(201)
      .expect(() => {
        expect(authService.register).toHaveBeenCalledWith({
          email: 'member@example.com',
          fullName: 'Nguyen Van A',
          password: 'password123',
        });
      });
  });

  it('rejects login body with invalid email and short password', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'not-email',
        password: '123',
      })
      .expect(400)
      .expect((response) => {
        const body = response.body as ErrorResponse;

        expect(body.errors).toEqual(
          expect.arrayContaining([
            'email must be an email',
            'password must be longer than or equal to 8 characters',
          ]),
        );
        expect(authService.login).not.toHaveBeenCalled();
      });
  });

  it('accepts valid login body', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'member@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'member@example.com',
          password: 'password123',
        });
      });
  });
});
