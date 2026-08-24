import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyMfaDto } from '../dto/verify-mfa.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthService } from '../services/auth.service';
import type { AuthUser } from '../types/auth-user.type';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Buoc 1: yeu cau ma xac thuc dang ky',
    description:
      'Kiem tra email chua ton tai roi gui OTP 6 so den email. Chua tao tai khoan va chua tra token o buoc nay.',
  })
  @ApiResponse({ status: 201, description: 'Da gui ma xac thuc.' })
  @ApiResponse({
    status: 400,
    description:
      'Request body khong hop le hoac chua het thoi gian cho gui lai.',
  })
  @ApiResponse({ status: 409, description: 'Email da ton tai.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Buoc 2: xac thuc OTP va tao tai khoan',
    description:
      'OTP dung thi tao tai khoan, danh dau email da xac thuc va tra accessToken/refreshToken.',
  })
  @ApiResponse({ status: 201, description: 'Xac thuc thanh cong.' })
  @ApiResponse({
    status: 400,
    description: 'OTP sai, het han hoac vuot so lan thu cho phep.',
  })
  @ApiResponse({ status: 409, description: 'Email da ton tai.' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyRegistrationOtp(dto);
    this.setRefreshTokenCookie(response, result.refreshToken);

    return result.body;
  }

  @Post('resend-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Gui lai ma xac thuc',
    description:
      'Cap OTP moi cho yeu cau dang ky dang cho. Moi lan gui cach nhau it nhat 60 giay.',
  })
  @ApiResponse({ status: 201, description: 'Da gui lai ma xac thuc.' })
  @ApiResponse({
    status: 400,
    description: 'Chua het thoi gian cho hoac khong co yeu cau dang ky nao.',
  })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendRegistrationOtp(dto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Dang nhap',
    description: 'Nhap email/password de lay accessToken va refreshToken.',
  })
  @ApiResponse({ status: 201, description: 'Dang nhap thanh cong.' })
  @ApiResponse({ status: 400, description: 'Request body khong hop le.' })
  @ApiResponse({ status: 401, description: 'Sai email hoac mat khau.' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(
      dto,
      this.requestContext(request),
    );
    if ('mfaRequired' in result) return result.body;
    this.setRefreshTokenCookie(response, result.refreshToken);

    return result.body;
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('mfa/verify')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async verifyMfa(
    @Body() dto: VerifyMfaDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyMfa(dto);
    this.setRefreshTokenCookie(response, result.refreshToken);
    return result.body;
  }

  @Patch('mfa')
  @UseGuards(AccessTokenGuard)
  setMfa(@CurrentUser() user: AuthUser, @Body() dto: { enabled: boolean }) {
    return this.authService.setMfa(user, dto.enabled === true);
  }

  @Post('refresh')
  @UseGuards(ThrottlerGuard, RefreshTokenGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Lam moi token',
    description:
      'Refresh token duoc gui tu HttpOnly cookie, FE khong doc truc tiep token nay.',
  })
  @ApiResponse({ status: 201, description: 'Cap token moi thanh cong.' })
  @ApiResponse({ status: 401, description: 'Refresh token khong hop le.' })
  refresh(
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.getRefreshTokenFromCookie(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.authService.refreshTokens(user, refreshToken).then((result) => {
      this.setRefreshTokenCookie(response, result.refreshToken);
      return result.body;
    });
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dang xuat',
    description:
      'Dan accessToken vao Authorize. API se xoa refresh token hash trong DB.',
  })
  @ApiResponse({ status: 201, description: 'Dang xuat thanh cong.' })
  @ApiResponse({ status: 401, description: 'Access token khong hop le.' })
  @UseGuards(AccessTokenGuard)
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.clearRefreshTokenCookie(response);
    return this.authService.logout(user);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lay thong tin user hien tai',
    description: 'Dan accessToken vao Authorize de xem user dang dang nhap.',
  })
  @ApiResponse({ status: 200, description: 'Lay thong tin thanh cong.' })
  @ApiResponse({ status: 401, description: 'Access token khong hop le.' })
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user);
  }

  @Get('sessions')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  sessions(@CurrentUser() user: AuthUser) {
    return this.authService.getSessions(user);
  }

  @Delete('sessions/others')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  revokeOthers(@CurrentUser() user: AuthUser) {
    return this.authService.revokeOtherSessions(user);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  revokeSession(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.authService.revokeSession(user, sessionId);
  }

  private requestContext(request: Request) {
    return {
      ipAddress: request.ip ?? request.socket?.remoteAddress ?? null,
      userAgent: request.headers['user-agent'] ?? null,
    };
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.cookie(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      this.getRefreshTokenCookieOptions(),
    );
  }

  private clearRefreshTokenCookie(response: Response) {
    response.clearCookie(
      REFRESH_TOKEN_COOKIE,
      this.getRefreshTokenCookieBaseOptions(),
    );
  }

  private getRefreshTokenFromCookie(request: Request) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.startsWith(`${REFRESH_TOKEN_COOKIE}=`),
    );

    if (!refreshTokenCookie) {
      return null;
    }

    return decodeURIComponent(refreshTokenCookie.split('=').slice(1).join('='));
  }

  private getRefreshTokenCookieOptions(): CookieOptions {
    return {
      ...this.getRefreshTokenCookieBaseOptions(),
      httpOnly: true,
      maxAge: this.getRefreshTokenCookieMaxAge(),
    };
  }

  private getRefreshTokenCookieBaseOptions(): CookieOptions {
    const isProduction =
      process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    const configuredSameSite =
      process.env.REFRESH_COOKIE_SAME_SITE?.trim().toLowerCase();
    const sameSite: 'lax' | 'strict' | 'none' =
      configuredSameSite === 'lax' ||
      configuredSameSite === 'strict' ||
      configuredSameSite === 'none'
        ? configuredSameSite
        : isProduction
          ? 'none'
          : 'lax';
    const configuredSecure =
      process.env.REFRESH_COOKIE_SECURE?.trim().toLowerCase();
    const secure =
      configuredSecure === 'true'
        ? true
        : configuredSecure === 'false'
          ? false
          : sameSite === 'none' || isProduction;

    return {
      httpOnly: true,
      path: '/api/v1/auth',
      sameSite,
      secure,
    };
  }

  private getRefreshTokenCookieMaxAge() {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit as keyof typeof multipliers];
  }
}
