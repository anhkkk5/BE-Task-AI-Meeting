import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(@InjectRepository(Notification) private readonly repository: Repository<Notification>) {}
  create(data: Partial<Notification>) { return this.repository.save(this.repository.create(data)); }
  findByIdempotencyKey(idempotencyKey: string) { return this.repository.findOne({ where: { idempotencyKey } }); }
  findForUser(recipientId: string, page: number, limit: number, unreadOnly: boolean) {
    const query = this.repository.createQueryBuilder('notification')
      .where('notification.recipient_id = :recipientId', { recipientId })
      .andWhere('notification.archived_at IS NULL')
      .orderBy('notification.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (unreadOnly) query.andWhere('notification.read_at IS NULL');
    return query.getManyAndCount();
  }
  countUnread(recipientId: string) { return this.repository.count({ where: { recipientId, readAt: IsNull(), archivedAt: IsNull() } }); }
  findOwned(id: string, recipientId: string) { return this.repository.findOne({ where: { id, recipientId } }); }
  async markRead(notification: Notification) { notification.readAt ??= new Date(); return this.repository.save(notification); }
  markAllRead(recipientId: string) {
    return this.repository.createQueryBuilder().update(Notification).set({ readAt: () => 'CURRENT_TIMESTAMP(6)' }).where('recipient_id = :recipientId', { recipientId }).andWhere('read_at IS NULL').andWhere('archived_at IS NULL').execute();
  }
  archive(notification: Notification) { notification.archivedAt = new Date(); return this.repository.save(notification); }
}
