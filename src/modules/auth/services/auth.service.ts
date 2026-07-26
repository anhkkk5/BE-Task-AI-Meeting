import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
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
import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  OtpService,
} from './otp.service';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
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

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
    );

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return this.authResponse('Login successfully', user, tokens);
  }

  async refreshTokens(authUser: AuthUser, refreshToken: string) {
    const user = await this.usersService.findById(authUser.id);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return this.authResponse('Refresh token successfully', user, tokens);
  }

  async logout(authUser: AuthUser) {
    await this.usersService.updateRefreshTokenHash(authUser.id, null);

    return {
      success: true,
      message: 'Logout successfully',
      data: null,
    };
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

  private async issueTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
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
