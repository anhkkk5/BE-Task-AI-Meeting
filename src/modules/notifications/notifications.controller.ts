import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { NotificationsService } from './notifications.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Controller('notifications')
@UseGuards(AccessTokenGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: GetNotificationsQueryDto) { return this.service.list(user.id, query); }
  @Patch('read-all') markAllRead(@CurrentUser() user: AuthUser) { return this.service.markAllRead(user.id); }
  @Get('preferences') getPreferences(@CurrentUser() user: AuthUser) { return this.service.getPreferences(user.id); }
  @Patch('preferences') updatePreferences(@CurrentUser() user: AuthUser, @Body() dto: UpdateNotificationPreferencesDto) { return this.service.updatePreferences(user.id, dto); }
  @Patch(':id/read') markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.markRead(user.id, id); }
  @Patch(':id/archive') archive(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.archive(user.id, id); }
}
