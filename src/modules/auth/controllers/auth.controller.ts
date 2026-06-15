import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthService } from '../services/auth.service';
import type { AuthUser } from '../types/auth-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  refresh(
    @CurrentUser() user: AuthUser,
    @Headers('authorization') authorization: string,
  ) {
    return this.authService.refreshTokens(
      user,
      this.extractBearerToken(authorization),
    );
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  logout(@CurrentUser() user: AuthUser) {
    return this.authService.logout(user);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user);
  }

  private extractBearerToken(authorization: string) {
    return authorization.replace(/^Bearer\s+/i, '').trim();
  }
}
