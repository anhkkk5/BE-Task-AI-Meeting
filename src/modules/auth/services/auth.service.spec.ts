import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/services/mail.service';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';

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
  let otpService: jest.Mocked<
    Pick<
      OtpService,
      | 'generateOtp'
      | 'savePendingRegistration'
      | 'getPendingRegistration'
      | 'getResendCooldownSeconds'
      | 'verifyOtp'
      | 'clearPendingRegistration'
      | 'refreshOtp'
    >
  >;
  let mailService: jest.Mocked<Pick<MailService, 'sendMail'>>;

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
    otpService = {
      generateOtp: jest.fn().mockReturnValue('123456'),
      savePendingRegistration: jest.fn().mockResolvedValue(undefined),
      getPendingRegistration: jest.fn().mockResolvedValue(null),
      getResendCooldownSeconds: jest.fn().mockResolvedValue(0),
      verifyOtp: jest.fn(),
      clearPendingRegistration: jest.fn().mockResolvedValue(undefined),
      refreshOtp: jest.fn().mockResolvedValue(undefined),
    };
    mailService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };
    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      otpService as unknown as OtpService,
      mailService as unknown as MailService,
    );
  });

  it('buoc 1 chi gui OTP, chua tao tai khoan', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    const response = await authService.register({
      email: 'MEMBER@example.com',
      fullName: 'Team Member',
      password: 'password123',
    });

    // Diem quan trong nhat: chua duoc ghi user vao DB khi email chua xac thuc.
    expect(usersService.create).not.toHaveBeenCalled();
    expect(otpService.savePendingRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'member@example.com',
        fullName: 'Team Member',
      }),
      '123456',
    );
    expect(mailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'member@example.com' }),
    );
    // Mat khau phai duoc hash truoc khi giu tam, khong luu dang thuo.
    const pending = otpService.savePendingRegistration.mock.calls[0][0];
    expect(pending.passwordHash).not.toBe('password123');
    expect(response.data.email).toBe('member@example.com');
  });

  it('buoc 2 xac thuc OTP dung thi tao tai khoan va tra token', async () => {
    otpService.verifyOtp.mockResolvedValue({
      status: 'OK',
      registration: {
        email: 'member@example.com',
        fullName: 'Team Member',
        passwordHash: 'hashed',
      },
    });
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(user);

    const response = await authService.verifyRegistrationOtp({
      email: 'member@example.com',
      otp: '123456',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'member@example.com',
        emailVerifiedAt: expect.any(Date),
      }),
    );
    expect(otpService.clearPendingRegistration).toHaveBeenCalledWith(
      'member@example.com',
    );
    expect(response.body.data.user).not.toHaveProperty('passwordHash');
    expect(response.body.data.user).not.toHaveProperty('refreshTokenHash');
    expect(response.body.data.tokens).toEqual({ accessToken: 'access-token' });
    expect(response.refreshToken).toBe('refresh-token');
  });

  it('OTP sai thi khong tao tai khoan', async () => {
    otpService.verifyOtp.mockResolvedValue({
      status: 'INVALID',
      remainingAttempts: 4,
    });

    await expect(
      authService.verifyRegistrationOtp({
        email: 'member@example.com',
        otp: '000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(usersService.create).not.toHaveBeenCalled();
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

    expect(response.body.message).toBe('Login successfully');
    expect(response.body.data.tokens.accessToken).toBe('access-token');
    expect(response.body.data.tokens).not.toHaveProperty('refreshToken');
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
