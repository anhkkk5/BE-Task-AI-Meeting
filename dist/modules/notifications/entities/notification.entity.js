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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["TaskAssigned"] = "TASK_ASSIGNED";
    NotificationType["TaskMentioned"] = "TASK_MENTIONED";
    NotificationType["TaskDueSoon"] = "TASK_DUE_SOON";
    NotificationType["TaskOverdue"] = "TASK_OVERDUE";
    NotificationType["TaskBlockerResolved"] = "TASK_BLOCKER_RESOLVED";
    NotificationType["HandoverSubmitted"] = "HANDOVER_SUBMITTED";
    NotificationType["HandoverAccepted"] = "HANDOVER_ACCEPTED";
    NotificationType["HandoverRejected"] = "HANDOVER_REJECTED";
    NotificationType["HandoverChangesRequested"] = "HANDOVER_CHANGES_REQUESTED";
    NotificationType["MeetingInvited"] = "MEETING_INVITED";
    NotificationType["MeetingUpdated"] = "MEETING_UPDATED";
    NotificationType["MeetingCancelled"] = "MEETING_CANCELLED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification {
    id;
    recipientId;
    type;
    title;
    body;
    link;
    metadata;
    idempotencyKey;
    readAt;
    archivedAt;
    recipient;
    createdAt;
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recipient_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], Notification.prototype, "recipientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000 }),
    __metadata("design:type", String)
], Notification.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], Notification.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'idempotency_key', type: 'varchar', length: 200, nullable: true, unique: true }),
    __metadata("design:type", Object)
], Notification.prototype, "idempotencyKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_at', type: 'datetime', precision: 6, nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'archived_at', type: 'datetime', precision: 6, nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "archivedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'recipient_id' }),
    __metadata("design:type", user_entity_1.User)
], Notification.prototype, "recipient", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', precision: 6 }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications'),
    (0, typeorm_1.Index)(['recipientId', 'readAt', 'createdAt'])
], Notification);
//# sourceMappingURL=notification.entity.js.map