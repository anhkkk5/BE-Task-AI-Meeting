import { ArrayUnique, IsArray, IsEnum } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class UpdateNotificationPreferencesDto {
  @IsArray()
  @ArrayUnique()
  @IsEnum(NotificationType, { each: true })
  disabledTypes: NotificationType[];
}
