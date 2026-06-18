import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthService } from '../services/auth.service';
import type { AuthUser } from '../types/auth-user.type';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Dang ky tai khoan',
    description: 'Tao user moi, hash password va tra accessToken/refreshToken.',
  })
  @ApiResponse({ status: 201, description: 'Dang ky thanh cong.' })
  @ApiResponse({ status: 400, description: 'Request body khong hop le.' })
  @ApiResponse({ status: 409, description: 'Email da ton tai.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Dang nhap',
    description: 'Nhap email/password de lay accessToken va refreshToken.',
  })
  @ApiResponse({ status: 201, description: 'Dang nhap thanh cong.' })
  @ApiResponse({ status: 400, description: 'Request body khong hop le.' })
  @ApiResponse({ status: 401, description: 'Sai email hoac mat khau.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lam moi token',
    description:
      'Dan refreshToken vao Authorize dang Bearer token truoc khi goi API nay.',
  })
  @ApiResponse({ status: 201, description: 'Cap token moi thanh cong.' })
  @ApiResponse({ status: 401, description: 'Refresh token khong hop le.' })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dang xuat',
    description:
      'Dan accessToken vao Authorize. API se xoa refresh token hash trong DB.',
  })
  @ApiResponse({ status: 201, description: 'Dang xuat thanh cong.' })
  @ApiResponse({ status: 401, description: 'Access token khong hop le.' })
  @UseGuards(AccessTokenGuard)
  logout(@CurrentUser() user: AuthUser) {
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

  private extractBearerToken(authorization: string) {
    return authorization.replace(/^Bearer\s+/i, '').trim();
  }
}
