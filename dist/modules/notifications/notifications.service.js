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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_preference_entity_1 = require("./entities/notification-preference.entity");
const notifications_repository_1 = require("./repositories/notifications.repository");
let NotificationsService = class NotificationsService {
    repository;
    preferencesRepository;
    constructor(repository, preferencesRepository) {
        this.repository = repository;
        this.preferencesRepository = preferencesRepository;
    }
    async create(data) {
        const preference = await this.preferencesRepository.findOne({
            where: { userId: data.recipientId },
        });
        if (preference?.disabledTypes.includes(data.type))
            return null;
        if (data.idempotencyKey) {
            const existing = await this.repository.findByIdempotencyKey(data.idempotencyKey);
            if (existing)
                return existing;
        }
        try {
            return await this.repository.create({
                ...data,
                idempotencyKey: data.idempotencyKey ?? null,
                metadata: data.metadata ?? null,
                readAt: null,
                archivedAt: null,
            });
        }
        catch (error) {
            if (data.idempotencyKey) {
                const existing = await this.repository.findByIdempotencyKey(data.idempotencyKey);
                if (existing)
                    return existing;
            }
            throw error;
        }
    }
    async list(userId, query) {
        const [[items, total], unreadCount] = await Promise.all([
            this.repository.findForUser(userId, query.page, query.limit, query.unreadOnly),
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
    async markRead(userId, id) {
        const item = await this.repository.findOwned(id, userId);
        if (!item)
            throw new common_1.NotFoundException('Notification not found');
        await this.repository.markRead(item);
        return {
            success: true,
            message: 'Notification marked as read',
            data: null,
        };
    }
    async markAllRead(userId) {
        await this.repository.markAllRead(userId);
        return {
            success: true,
            message: 'All notifications marked as read',
            data: null,
        };
    }
    async archive(userId, id) {
        const item = await this.repository.findOwned(id, userId);
        if (!item || item.archivedAt)
            throw new common_1.NotFoundException('Notification not found');
        await this.repository.archive(item);
        return { success: true, message: 'Notification archived', data: null };
    }
    async getPreferences(userId) {
        const preference = await this.preferencesRepository.findOne({
            where: { userId },
        });
        return {
            success: true,
            message: 'Success',
            data: { disabledTypes: preference?.disabledTypes ?? [] },
        };
    }
    async updatePreferences(userId, dto) {
        const current = await this.preferencesRepository.findOne({
            where: { userId },
        });
        const saved = await this.preferencesRepository.save(this.preferencesRepository.create({
            ...current,
            userId,
            disabledTypes: [...dto.disabledTypes],
        }));
        return {
            success: true,
            message: 'Notification preferences updated',
            data: { disabledTypes: saved.disabledTypes },
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(notification_preference_entity_1.NotificationPreference)),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map