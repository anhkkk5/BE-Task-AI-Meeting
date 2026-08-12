import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConfig } from '../../../config/jwt.config';
import { MailService } from '../../mail/services/mail.service';
import { buildOtpMail } from '../../mail/templates/mail-templates';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyMfaDto } from '../dto/verify-mfa.dto';
import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  OtpService,
} from './otp.service';
import { AuthUser } from '../types/auth-user.type';
import { AuthSecurityRepository } from '../repositories/auth-security.repository';
import { randomUUID } from 'crypto';

type LoginContext = { ipAddress?: string | null; userAgent?: string | null };

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
    @Optional() private readonly authSecurityRepository?: AuthSecurityRepository,
  ) {}

  /**
   * Buoc 1 cua dang ky: chua tao tai khoan, chi luu tam va gui OTP.
   *
   * Tai khoan duoc tao o verifyRegistrationOtp de dam bao email la that va
   * tranh de lai user rac khi nguoi dung bo do giua duong.
   */
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const cooldown = await this.otpService.getResendCooldownSeconds(email);

    if (cooldown > 0) {
      throw new BadRequestException(
        `Ma xac thuc vua duoc gui. Vui long cho ${cooldown} giay truoc khi yeu cau lai.`,
      );
    }

    const fullName = dto.fullName.trim();
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);
    const otp = this.otpService.generateOtp();

    await this.otpService.savePendingRegistration(
      { email, fullName, passwordHash },
      otp,
    );
    await this.sendOtpMail(email, fullName, otp);

    return {
      success: true,
      message: 'Ma xac thuc da duoc gui den email cua ban.',
      data: {
        email,
        otpExpiresInSeconds: OTP_TTL_SECONDS,
        resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      },
    };
  }

  /**
   * Buoc 2 cua dang ky: OTP dung thi tao tai khoan va dang nhap luon.
   */
  async verifyRegistrationOtp(dto: VerifyOtpDto) {
    const email = dto.email.trim().toLowerCase();
    const result = await this.otpService.verifyOtp(email, dto.otp);

    if (result.status === 'NOT_FOUND') {
      throw new BadRequestException(
        'Ma xac thuc khong ton tai hoac da het han. Vui long dang ky lai.',
      );
    }

    if (result.status === 'TOO_MANY_ATTEMPTS') {
      throw new BadRequestException(
        `Ban da nhap sai qua ${OTP_MAX_ATTEMPTS} lan. Vui long dang ky lai de nhan ma moi.`,
      );
    }

    if (result.status === 'INVALID') {
      throw new BadRequestException(
        `Ma xac thuc khong dung. Ban con ${result.remainingAttempts} lan thu.`,
      );
    }

    // Kiem tra lai lan cuoi: co the co nguoi khac dang ky cung email trong
    // khoang thoi gian cho nhap OTP.
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      await this.otpService.clearPendingRegistration(email);
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create({
      email: result.registration.email,
      fullName: result.registration.fullName,
      passwordHash: result.registration.passwordHash,
      status: UserStatus.Active,
      emailVerifiedAt: new Date(),
    });

    await this.otpService.clearPendingRegistration(email);

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return this.authResponse('Register successfully', user, tokens);
  }

  /** Gui lai OTP cho ban ghi dang cho, co gioi han thoi gian cho. */
  async resendRegistrationOtp(dto: ResendOtpDto) {
    const email = dto.email.trim().toLowerCase();
    const cooldown = await this.otpService.getResendCooldownSeconds(email);

    if (cooldown > 0) {
      throw new BadRequestException(
        `Vui long cho ${cooldown} giay truoc khi yeu cau ma moi.`,
      );
    }

    const pending = await this.otpService.getPendingRegistration(email);

    if (!pending) {
      throw new BadRequestException(
        'Khong tim thay yeu cau dang ky nao dang cho. Vui long dang ky lai.',
      );
    }

    const otp = this.otpService.generateOtp();
    await this.otpService.refreshOtp(email, otp);
    await this.sendOtpMail(email, pending.fullName, otp);

    return {
      success: true,
      message: 'Ma xac thuc moi da duoc gui.',
      data: {
        email,
        otpExpiresInSeconds: OTP_TTL_SECONDS,
        resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      },
    };
  }

  /**
   * Gui mail OTP va nem loi neu that bai.
   *
   * Khac voi mail thong bao, day la mail nguoi dung dang doi nen khong the
   * that bai am tham: neu khong gui duoc thi phai bao de ho biet ma thu lai.
   */
  private async sendOtpMail(email: string, fullName: string, otp: string) {
    const mail = buildOtpMail({
      fullName,
      otp,
      expiresInMinutes: Math.round(OTP_TTL_SECONDS / 60),
    });

    try {
      await this.mailService.sendMail({
        to: email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    } catch {
      await this.otpService.clearPendingRegistration(email);
      throw new BadRequestException(
        'Khong gui duoc email xac thuc. Vui long kiem tra lai dia chi email hoac thu lai sau.',
      );
    }
  }

  async login(dto: LoginDto, context: LoginContext = {}) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(
      email,
    );

    if (!user || user.status !== UserStatus.Active) {
      await this.recordLoginAttempt(null, email, false, 'INVALID_ACCOUNT', context);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.recordLoginAttempt(user.id, email, false, 'INVALID_PASSWORD', context);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.mfaEnabled) {
      const otp = this.otpService.generateOtp();
      await this.otpService.saveSecurityChallenge('mfa', user.email, otp, { userId: user.id, ...context });
      await this.sendSecurityOtp(user.email, user.fullName, otp, 'Mã xác thực đăng nhập');
      return { mfaRequired: true as const, body: { success: true, message: 'Cần xác thực MFA', data: { mfaRequired: true, email: user.email, otpExpiresInSeconds: OTP_TTL_SECONDS } } };
    }

    const tokens = await this.issueSessionTokens(user, context);
    await this.recordLoginAttempt(user.id, email, true, 'PASSWORD', context);

    return this.authResponse('Login successfully', user, tokens);
  }

  async refreshTokens(authUser: AuthUser, refreshToken: string) {
    const user = await this.usersService.findById(authUser.id);

    const session = authUser.sessionId && this.authSecurityRepository ? await this.authSecurityRepository.findSession(authUser.sessionId, authUser.id) : null;
    if (!user || (!session && !user.refreshTokenHash)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      session?.refreshTokenHash ?? user.refreshTokenHash!,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user, authUser.sessionId);
    if (session && this.authSecurityRepository) await this.authSecurityRepository.updateSession(session.id, { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, this.saltRounds), lastUsedAt: new Date() });
    else await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return this.authResponse('Refresh token successfully', user, tokens);
  }

  async logout(authUser: AuthUser) {
    if (authUser.sessionId && this.authSecurityRepository) await this.authSecurityRepository.revokeSession(authUser.sessionId, authUser.id);
    else await this.usersService.updateRefreshTokenHash(authUser.id, null);

    return {
      success: true,
      message: 'Logout successfully',
      data: null,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (user?.status === UserStatus.Active) {
      const otp = this.otpService.generateOtp();
      await this.otpService.saveSecurityChallenge('reset', email, otp, { userId: user.id });
      await this.sendSecurityOtp(email, user.fullName, otp, 'Mã đặt lại mật khẩu');
    }
    return { success: true, message: 'Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi.', data: { email, otpExpiresInSeconds: OTP_TTL_SECONDS } };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const result = await this.otpService.verifySecurityChallenge('reset', email, dto.otp);
    if (result.status !== 'OK') throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
    const user = await this.usersService.findByEmail(email);
    if (!user || result.data.userId !== user.id) throw new BadRequestException('Mã xác thực không hợp lệ');
    await this.usersService.updateSecurity(user.id, { passwordHash: await bcrypt.hash(dto.newPassword, this.saltRounds), refreshTokenHash: null });
    await this.authSecurityRepository?.revokeOtherSessions(user.id);
    return { success: true, message: 'Đặt lại mật khẩu thành công', data: null };
  }

  async setMfa(authUser: AuthUser, enabled: boolean) {
    const user = await this.usersService.updateSecurity(authUser.id, { mfaEnabled: enabled, refreshTokenHash: enabled ? null : undefined });
    if (enabled) await this.authSecurityRepository?.revokeOtherSessions(authUser.id, authUser.sessionId);
    return { success: true, message: enabled ? 'Đã bật MFA qua email' : 'Đã tắt MFA', data: user ? this.toPublicUser(user) : null };
  }

  async verifyMfa(dto: VerifyMfaDto) {
    const email = dto.email.trim().toLowerCase();
    const result = await this.otpService.verifySecurityChallenge('mfa', email, dto.otp);
    if (result.status !== 'OK') throw new UnauthorizedException('Mã MFA không hợp lệ hoặc đã hết hạn');
    const user = await this.usersService.findByEmail(email);
    if (!user || result.data.userId !== user.id || !user.mfaEnabled) throw new UnauthorizedException('Mã MFA không hợp lệ');
    const context = { ipAddress: result.data.ipAddress as string | undefined, userAgent: result.data.userAgent as string | undefined };
    const tokens = await this.issueSessionTokens(user, context);
    await this.recordLoginAttempt(user.id, email, true, 'MFA', context);
    return this.authResponse('Xác thực MFA thành công', user, tokens);
  }

  private sendSecurityOtp(email: string, fullName: string, otp: string, subject: string) {
    return this.mailService.sendMail({ to: email, subject, html: `<p>Xin chào ${fullName},</p><p>Mã xác thực của bạn là <strong>${otp}</strong>. Mã hết hạn sau 10 phút.</p>`, text: `Mã xác thực của bạn là ${otp}. Mã hết hạn sau 10 phút.` });
  }

  async getMe(authUser: AuthUser) {
    const user = await this.usersService.findById(authUser.id);

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      success: true,
      message: 'Success',
      data: this.toPublicUser(user),
    };
  }

  async getSessions(authUser: AuthUser) {
    const items = this.authSecurityRepository ? await this.authSecurityRepository.listSessions(authUser.id) : [];
    return { success: true, message: 'Get sessions successfully', data: { items: items.map((item) => ({ id: item.id, current: item.id === authUser.sessionId, userAgent: item.userAgent, ipAddress: item.ipAddress, lastUsedAt: item.lastUsedAt, createdAt: item.createdAt, expiresAt: item.expiresAt, revokedAt: item.revokedAt })) } };
  }

  async revokeSession(authUser: AuthUser, sessionId: string) { await this.authSecurityRepository?.revokeSession(sessionId, authUser.id); return { success: true, message: 'Session revoked', data: null }; }
  async revokeOtherSessions(authUser: AuthUser) { await this.authSecurityRepository?.revokeOtherSessions(authUser.id, authUser.sessionId); return { success: true, message: 'Other sessions revoked', data: null }; }

  private async issueTokens(user: User, sessionId?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      ...(sessionId ? { sid: sessionId } : {}),
    };
    const config = jwtConfig();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: config.accessSecret,
        expiresIn: config.accessExpiresIn as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: config.refreshSecret,
        expiresIn: config.refreshExpiresIn as JwtSignOptions['expiresIn'],
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async issueSessionTokens(user: User, context: LoginContext) {
    if (!this.authSecurityRepository) { const tokens = await this.issueTokens(user); await this.storeRefreshTokenHash(user.id, tokens.refreshToken); return tokens; }
    const sessionId = randomUUID(); const tokens = await this.issueTokens(user, sessionId); const now = new Date();
    await this.authSecurityRepository.createSession({ id: sessionId, userId: user.id, refreshTokenHash: await bcrypt.hash(tokens.refreshToken, this.saltRounds), ipAddress: context.ipAddress ?? null, userAgent: context.userAgent?.slice(0, 500) ?? null, lastUsedAt: now, expiresAt: new Date(now.getTime() + 7 * 86400000), revokedAt: null }); return tokens;
  }

  private recordLoginAttempt(userId: string | null, email: string, success: boolean, reason: string, context: LoginContext) { return this.authSecurityRepository?.recordAttempt({ userId, email, success, reason, ipAddress: context.ipAddress ?? null, userAgent: context.userAgent?.slice(0, 500) ?? null }) ?? Promise.resolve(); }

  private async storeRefreshTokenHash(userId: string, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, this.saltRounds);
    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);
  }

  private authResponse(
    message: string,
    user: User,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    return {
      body: {
        success: true,
        message,
        data: {
          user: this.toPublicUser(user),
          tokens: {
            accessToken: tokens.accessToken,
          },
        },
      },
      refreshToken: tokens.refreshToken,
    };
  }

  private toPublicUser(user: User) {
    return this.usersService.toPublicUser(user);
  }
}
