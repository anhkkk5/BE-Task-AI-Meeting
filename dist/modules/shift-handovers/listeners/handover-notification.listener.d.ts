import { OnModuleInit } from '@nestjs/common';
import { MailService } from '../../mail/services/mail.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { HandoverEventsService } from '../services/handover-events.service';
export declare class HandoverNotificationListener implements OnModuleInit {
    private readonly handoverEvents;
    private readonly mailService;
    private readonly notificationsService;
    private readonly logger;
    constructor(handoverEvents: HandoverEventsService, mailService: MailService, notificationsService: NotificationsService);
    onModuleInit(): void;
    private handleEvent;
    private createInAppNotification;
    private notifySubmitted;
    private notifyAccepted;
    private notifyRejected;
    private notifyChangesRequested;
    private taskLabel;
    private handoverUrl;
    private formatDate;
}
