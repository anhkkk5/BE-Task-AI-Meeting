import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateAiUserPreferencesDto } from '../dto/update-ai-user-preferences.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AiUserPreferencesService } from '../services/ai-user-preferences.service';
import { UsersService } from '../services/users.service';
import { AvatarUploadService } from '../services/avatar-upload.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly aiUserPreferencesService: AiUserPreferencesService,
    private readonly avatarUploadService: AvatarUploadService,
  ) {}

  @Get('me/ai-preferences')
  @ApiOperation({ summary: 'Xem cấu hình cá nhân hóa AI' })
  getAiPreferences(@CurrentUser() user: AuthUser) {
    return this.aiUserPreferencesService.getPreferences(user.id);
  }

  @Patch('me/ai-preferences')
  @ApiOperation({ summary: 'Cập nhật cấu hình cá nhân hóa AI' })
  updateAiPreferences(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAiUserPreferencesDto,
  ) {
    return this.aiUserPreferencesService.updatePreferences(user.id, dto);
  }

  @Delete('me/ai-preferences')
  @ApiOperation({ summary: 'Khôi phục cấu hình AI mặc định' })
  resetAiPreferences(@CurrentUser() user: AuthUser) {
    return this.aiUserPreferencesService.resetPreferences(user.id);
  }

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

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } }, required: ['avatar'] } })
  @ApiOperation({ summary: 'Tải ảnh đại diện lên Cloudinary' })
  async uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploaded = await this.avatarUploadService.upload(user.id, file);
    return this.usersService.updateProfile(user.id, { avatarUrl: uploaded.secure_url });
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
