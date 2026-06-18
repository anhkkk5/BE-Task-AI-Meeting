import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Xem ho so ca nhan',
    description: 'Dan accessToken vao Authorize de lay profile user hien tai.',
  })
  @ApiResponse({ status: 200, description: 'Lay profile thanh cong.' })
  @ApiResponse({ status: 401, description: 'Access token khong hop le.' })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Cap nhat ho so ca nhan',
    description:
      'Dan accessToken vao Authorize, sau do gui cac field profile can cap nhat.',
  })
  @ApiResponse({ status: 200, description: 'Cap nhat profile thanh cong.' })
  @ApiResponse({ status: 400, description: 'Request body khong hop le.' })
  @ApiResponse({ status: 401, description: 'Access token khong hop le.' })
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  @ApiOperation({
    summary: 'Doi mat khau',
    description:
      'Dan accessToken vao Authorize. Can nhap currentPassword va newPassword.',
  })
  @ApiResponse({ status: 200, description: 'Doi mat khau thanh cong.' })
  @ApiResponse({ status: 400, description: 'Request body khong hop le.' })
  @ApiResponse({
    status: 401,
    description: 'Access token khong hop le hoac currentPassword sai.',
  })
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, dto);
  }
}
