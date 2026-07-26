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
var HandoverNotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandoverNotificationListener = void 0;
const common_1 = require("@nestjs/common");
const mail_config_1 = require("../../../config/mail.config");
const mail_service_1 = require("../../mail/services/mail.service");
const mail_templates_1 = require("../../mail/templates/mail-templates");
const handover_events_service_1 = require("../services/handover-events.service");
let HandoverNotificationListener = HandoverNotificationListener_1 = class HandoverNotificationListener {
    handoverEvents;
    mailService;
    logger = new common_1.Logger(HandoverNotificationListener_1.name);
    constructor(handoverEvents, mailService) {
        this.handoverEvents = handoverEvents;
        this.mailService = mailService;
    }
    onModuleInit() {
        this.handoverEvents.onHandoverEvent((event) => this.handleEvent(event));
    }
    async handleEvent(event) {
        switch (event.type) {
            case 'submitted':
                await this.notifySubmitted(event.handover);
                break;
            case 'accepted':
                await this.notifyAccepted(event.handover);
                break;
            case 'rejected':
                await this.notifyRejected(event.handover, event.reason);
                break;
            case 'changes_requested':
                await this.notifyChangesRequested(event.handover, event.reason);
                break;
        }
    }
    async notifySubmitted(handover) {
        const receiverEmail = handover.receiver?.email;
        if (!receiverEmail) {
            this.logger.warn(`Khong co email nguoi nhan cho ban giao ${handover.id}, bo qua gui mail.`);
            return;
        }
        const mail = (0, mail_templates_1.buildHandoverSubmittedMail)({
            recipientName: handover.receiver?.fullName ?? 'ban',
            counterpartName: handover.sender?.fullName ?? 'Mot thanh vien',
            taskLabel: this.taskLabel(handover),
            handoverUrl: this.handoverUrl(handover),
            completedWork: handover.completedWork ?? '(khong co)',
            remainingWork: handover.remainingWork ?? '(khong co)',
            blockers: handover.blockers,
            dueAt: this.formatDate(handover.dueAt),
        });
        await this.mailService.sendMailSafely({
            to: receiverEmail,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
        });
    }
    async notifyAccepted(handover) {
        const senderEmail = handover.sender?.email;
        if (!senderEmail) {
            this.logger.warn(`Khong co email nguoi giao cho ban giao ${handover.id}, bo qua gui mail.`);
            return;
        }
        const mail = (0, mail_templates_1.buildHandoverAcceptedMail)({
            recipientName: handover.sender?.fullName ?? 'ban',
            counterpartName: handover.receiver?.fullName ?? 'Nguoi nhan',
            taskLabel: this.taskLabel(handover),
            handoverUrl: this.handoverUrl(handover),
        });
        await this.mailService.sendMailSafely({
            to: senderEmail,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
        });
    }
    async notifyRejected(handover, reason) {
        const senderEmail = handover.sender?.email;
        if (!senderEmail) {
            this.logger.warn(`Khong co email nguoi giao cho ban giao ${handover.id}, bo qua gui mail.`);
            return;
        }
        const mail = (0, mail_templates_1.buildHandoverRejectedMail)({
            recipientName: handover.sender?.fullName ?? 'ban',
            counterpartName: handover.receiver?.fullName ?? 'Nguoi nhan',
            taskLabel: this.taskLabel(handover),
            handoverUrl: this.handoverUrl(handover),
            reason: reason?.trim() || 'Khong co ly do cu the',
        });
        await this.mailService.sendMailSafely({
            to: senderEmail,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
        });
    }
    async notifyChangesRequested(handover, reason) {
        const senderEmail = handover.sender?.email;
        if (!senderEmail) {
            this.logger.warn(`Khong co email nguoi giao cho ban giao ${handover.id}, bo qua gui mail.`);
            return;
        }
        const mail = (0, mail_templates_1.buildHandoverChangesRequestedMail)({
            recipientName: handover.sender?.fullName ?? 'ban',
            counterpartName: handover.receiver?.fullName ?? 'Nguoi nhan',
            taskLabel: this.taskLabel(handover),
            handoverUrl: this.handoverUrl(handover),
            reason: reason?.trim() || 'Khong co noi dung cu the',
        });
        await this.mailService.sendMailSafely({
            to: senderEmail,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
        });
    }
    taskLabel(handover) {
        if (handover.task) {
            return `${handover.task.taskCode} - ${handover.task.title}`;
        }
        return handover.title ?? 'Cong viec';
    }
    handoverUrl(handover) {
        const { appUrl } = (0, mail_config_1.mailConfig)();
        return `${appUrl}/workspaces/${handover.workspaceId}/projects/${handover.projectId}/shift-handovers`;
    }
    formatDate(value) {
        if (!value) {
            return null;
        }
        return new Date(value).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    }
};
exports.HandoverNotificationListener = HandoverNotificationListener;
exports.HandoverNotificationListener = HandoverNotificationListener = HandoverNotificationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [handover_events_service_1.HandoverEventsService,
        mail_service_1.MailService])
], HandoverNotificationListener);
//# sourceMappingURL=handover-notification.listener.js.map