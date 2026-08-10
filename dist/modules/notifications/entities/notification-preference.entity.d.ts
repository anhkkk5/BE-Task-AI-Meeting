import { User } from '../../users/entities/user.entity';
import { NotificationType } from './notification.entity';
export declare class NotificationPreference {
    id: string;
    userId: string;
    disabledTypes: NotificationType[];
    user: User;
    updatedAt: Date;
}
