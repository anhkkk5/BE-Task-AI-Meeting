import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from './entities/notification.entity';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationsRepository } from './repositories/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repository: NotificationsRepository,
    @InjectRepository(NotificationPreference)
    private readonly preferencesRepository: Repository<NotificationPreference>,
  ) {}
  async create(data: {
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    link: string;
    metadata?: Record<string, unknown>;
    idempotencyKey?: string;
  }) {
    const preference = await this.preferencesRepository.findOne({
      where: { userId: data.recipientId },
    });
    if (preference?.disabledTypes.includes(data.type)) return null;
    if (data.idempotencyKey) {
      const existing = await this.repository.findByIdempotencyKey(
        data.idempotencyKey,
      );
      if (existing) return existing;
    }
    try {
      return await this.repository.create({
        ...data,
        idempotencyKey: data.idempotencyKey ?? null,
        metadata: data.metadata ?? null,
        readAt: null,
        archivedAt: null,
      });
    } catch (error) {
      if (data.idempotencyKey) {
        const existing = await this.repository.findByIdempotencyKey(
          data.idempotencyKey,
        );
        if (existing) return existing;
      }
      throw error;
    }
  }
  async list(userId: string, query: GetNotificationsQueryDto) {
    const [[items, total], unreadCount] = await Promise.all([
      this.repository.findForUser(
        userId,
        query.page,
        query.limit,
        query.unreadOnly,
      ),
      this.repository.countUnread(userId),
    ]);
    return {
      success: true,
      message: 'Success',
      data: {
        items,
        unreadCount,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      },
    };
  }
  async markRead(userId: string, id: string) {
    const item = await this.repository.findOwned(id, userId);
    if (!item) throw new NotFoundException('Notification not found');
    await this.repository.markRead(item);
    return {
      success: true,
      message: 'Notification marked as read',
      data: null,
    };
  }
  async markAllRead(userId: string) {
    await this.repository.markAllRead(userId);
    return {
      success: true,
      message: 'All notifications marked as read',
      data: null,
    };
  }
  async archive(userId: string, id: string) {
    const item = await this.repository.findOwned(id, userId);
    if (!item || item.archivedAt)
      throw new NotFoundException('Notification not found');
    await this.repository.archive(item);
    return { success: true, message: 'Notification archived', data: null };
  }
  async getPreferences(userId: string) {
    const preference = await this.preferencesRepository.findOne({
      where: { userId },
    });
    return {
      success: true,
      message: 'Success',
      data: { disabledTypes: preference?.disabledTypes ?? [] },
    };
  }
  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    const current = await this.preferencesRepository.findOne({
      where: { userId },
    });
    const saved = await this.preferencesRepository.save(
      this.preferencesRepository.create({
        ...current,
        userId,
        disabledTypes: [...dto.disabledTypes],
      }),
    );
    return {
      success: true,
      message: 'Notification preferences updated',
      data: { disabledTypes: saved.disabledTypes },
    };
  }
}
