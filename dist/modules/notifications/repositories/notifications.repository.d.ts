import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
export declare class NotificationsRepository {
    private readonly repository;
    constructor(repository: Repository<Notification>);
    create(data: Partial<Notification>): Promise<Notification>;
    findByIdempotencyKey(idempotencyKey: string): Promise<Notification | null>;
    findForUser(recipientId: string, page: number, limit: number, unreadOnly: boolean): Promise<[Notification[], number]>;
    countUnread(recipientId: string): Promise<number>;
    findOwned(id: string, recipientId: string): Promise<Notification | null>;
    markRead(notification: Notification): Promise<Notification>;
    markAllRead(recipientId: string): Promise<import("typeorm").UpdateResult>;
    archive(notification: Notification): Promise<Notification>;
}
