import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<
    Pick<
      UsersService,
      | 'create'
      | 'findByEmail'
      | 'findById'
      | 'toPublicUser'
      | 'updateRefreshTokenHash'
    >
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  const user = {
    id: 'user-id',
    email: 'member@example.com',
    fullName: 'Team Member',
    passwordHash: '',
    status: UserStatus.Active,
    refreshTokenHash: null,
    createdAt: new Date('2026-06-14T00:00:00.000Z'),
    updatedAt: new Date('2026-06-14T00:00:00.000Z'),
  } as User;

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toPublicUser: jest.fn((input: User) => ({
        id: input.id,
        email: input.email,
        fullName: input.fullName,
        avatarUrl: input.avatarUrl,
        phoneNumber: input.phoneNumber,
        jobTitle: input.jobTitle,
        status: input.status,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
      })),
      updateRefreshTokenHash: jest.fn(),
    };
    jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    };
    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('registers a new user and hides sensitive fields', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(user);

    const response = await authService.register({
      email: 'MEMBER@example.com',
      fullName: 'Team Member',
      password: 'password123',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'member@example.com',
        fullName: 'Team Member',
      }),
    );
    expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(
      user.id,
      expect.any(String),
    );
    expect(response.data.user).not.toHaveProperty('passwordHash');
    expect(response.data.user).not.toHaveProperty('refreshTokenHash');
    expect(response.data.tokens).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('rejects duplicate registration email', async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      authService.register({
        email: user.email,
        fullName: user.fullName,
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    usersService.findByEmail.mockResolvedValue({ ...user, passwordHash });

    const response = await authService.login({
      email: user.email,
      password: 'password123',
    });

    expect(response.message).toBe('Login successfully');
    expect(response.data.tokens.accessToken).toBe('access-token');
  });

  it('rejects invalid login credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    usersService.findByEmail.mockResolvedValue({ ...user, passwordHash });

    await expect(
      authService.login({
        email: user.email,
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logs out by clearing refresh token hash', async () => {
    const response = await authService.logout({
      id: user.id,
      email: user.email,
    });

    expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(
      user.id,
      null,
    );
    expect(response).toEqual({
      success: true,
      message: 'Logout successfully',
      data: null,
    });
  });
});
