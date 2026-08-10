import { Repository } from 'typeorm';
import { NotificationType } from './entities/notification.entity';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationsRepository } from './repositories/notifications.repository';
export declare class NotificationsService {
    private readonly repository;
    private readonly preferencesRepository;
    constructor(repository: NotificationsRepository, preferencesRepository: Repository<NotificationPreference>);
    create(data: {
        recipientId: string;
        type: NotificationType;
        title: string;
        body: string;
        link: string;
        metadata?: Record<string, unknown>;
        idempotencyKey?: string;
    }): Promise<import("./entities/notification.entity").Notification | null>;
    list(userId: string, query: GetNotificationsQueryDto): Promise<{
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
    markRead(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    markAllRead(userId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    archive(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getPreferences(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            disabledTypes: NotificationType[];
        };
    }>;
    updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto): Promise<{
        success: boolean;
        message: string;
        data: {
            disabledTypes: NotificationType[];
        };
    }>;
}
