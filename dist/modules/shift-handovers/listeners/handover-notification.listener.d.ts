import { OnModuleInit } from '@nestjs/common';
import { MailService } from '../../mail/services/mail.service';
import { HandoverEventsService } from '../services/handover-events.service';
export declare class HandoverNotificationListener implements OnModuleInit {
    private readonly handoverEvents;
    private readonly mailService;
    private readonly logger;
    constructor(handoverEvents: HandoverEventsService, mailService: MailService);
    onModuleInit(): void;
    private handleEvent;
    private notifySubmitted;
    private notifyAccepted;
    private notifyRejected;
    private notifyChangesRequested;
    private taskLabel;
    private handoverUrl;
    private formatDate;
}
