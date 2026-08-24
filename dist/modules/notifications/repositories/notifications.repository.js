"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../entities/notification.entity");
let NotificationsRepository = class NotificationsRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        return this.repository.save(this.repository.create(data));
    }
    findByIdempotencyKey(idempotencyKey) {
        return this.repository.findOne({ where: { idempotencyKey } });
    }
    findForUser(recipientId, page, limit, unreadOnly) {
        const query = this.repository
            .createQueryBuilder('notification')
            .where('notification.recipient_id = :recipientId', { recipientId })
            .andWhere('notification.archived_at IS NULL')
            .orderBy('notification.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (unreadOnly)
            query.andWhere('notification.read_at IS NULL');
        return query.getManyAndCount();
    }
    countUnread(recipientId) {
        return this.repository.count({
            where: { recipientId, readAt: (0, typeorm_2.IsNull)(), archivedAt: (0, typeorm_2.IsNull)() },
        });
    }
    findOwned(id, recipientId) {
        return this.repository.findOne({ where: { id, recipientId } });
    }
    async markRead(notification) {
        notification.readAt ??= new Date();
        return this.repository.save(notification);
    }
    markAllRead(recipientId) {
        return this.repository
            .createQueryBuilder()
            .update(notification_entity_1.Notification)
            .set({ readAt: () => 'CURRENT_TIMESTAMP(6)' })
            .where('recipient_id = :recipientId', { recipientId })
            .andWhere('read_at IS NULL')
            .andWhere('archived_at IS NULL')
            .execute();
    }
    archive(notification) {
        notification.archivedAt = new Date();
        return this.repository.save(notification);
    }
};
exports.NotificationsRepository = NotificationsRepository;
exports.NotificationsRepository = NotificationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsRepository);
//# sourceMappingURL=notifications.repository.js.map