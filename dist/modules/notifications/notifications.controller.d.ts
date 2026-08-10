import type { AuthUser } from '../auth/types/auth-user.type';
import { NotificationsService } from './notifications.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    list(user: AuthUser, query: GetNotificationsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: import("./entities/notification.entity").Notification[];
            unreadCount: number;
            meta: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    markAllRead(user: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getPreferences(user: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: {
            disabledTypes: import("./entities/notification.entity").NotificationType[];
        };
    }>;
    updatePreferences(user: AuthUser, dto: UpdateNotificationPreferencesDto): Promise<{
        success: boolean;
        message: string;
        data: {
            disabledTypes: import("./entities/notification.entity").NotificationType[];
        };
    }>;
    markRead(user: AuthUser, id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    archive(user: AuthUser, id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
