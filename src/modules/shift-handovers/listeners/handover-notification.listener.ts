import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { mailConfig } from '../../../config/mail.config';
import { MailService } from '../../mail/services/mail.service';
import {
  buildHandoverAcceptedMail,
  buildHandoverChangesRequestedMail,
  buildHandoverRejectedMail,
  buildHandoverSubmittedMail,
} from '../../mail/templates/mail-templates';
import { ShiftHandover } from '../entities/shift-handover.entity';
import { HandoverEvent } from '../events/handover.event';
import { HandoverEventsService } from '../services/handover-events.service';

/**
 * Gui email khi co thay doi tren ban giao cong viec.
 *
 * Truoc day nguoi lien quan khong biet gi cho den khi tu mo web ra xem, listener
 * nay chu dong thong bao qua email cho dung nguoi can biet.
 *
 * Toan bo mail deu gui qua sendMailSafely: thong bao chi la phu tro, khong duoc
 * lam that bai viec ban giao neu SMTP co van de.
 */
@Injectable()
export class HandoverNotificationListener implements OnModuleInit {
  private readonly logger = new Logger(HandoverNotificationListener.name);

  constructor(
    private readonly handoverEvents: HandoverEventsService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    this.handoverEvents.onHandoverEvent((event) => this.handleEvent(event));
  }

  private async handleEvent(event: HandoverEvent) {
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

  /** Gui cho nguoi nhan: co cong viec dang cho ban tiep nhan. */
  private async notifySubmitted(handover: ShiftHandover) {
    const receiverEmail = handover.receiver?.email;

    if (!receiverEmail) {
      this.logger.warn(
        `Khong co email nguoi nhan cho ban giao ${handover.id}, bo qua gui mail.`,
      );
      return;
    }

    const mail = buildHandoverSubmittedMail({
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

  /**
   * Cac su kien accepted/rejected/changes_requested deu do nguoi nhan thao tac,
   * nen nguoi can nhan mail la nguoi giao.
   */
  private async notifyAccepted(handover: ShiftHandover) {
    const senderEmail = handover.sender?.email;

    if (!senderEmail) {
      this.logger.warn(
        `Khong co email nguoi giao cho ban giao ${handover.id}, bo qua gui mail.`,
      );
      return;
    }

    const mail = buildHandoverAcceptedMail({
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

  private async notifyRejected(
    handover: ShiftHandover,
    reason?: string | null,
  ) {
    const senderEmail = handover.sender?.email;

    if (!senderEmail) {
      this.logger.warn(
        `Khong co email nguoi giao cho ban giao ${handover.id}, bo qua gui mail.`,
      );
      return;
    }

    const mail = buildHandoverRejectedMail({
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

  private async notifyChangesRequested(
    handover: ShiftHandover,
    reason?: string | null,
  ) {
    const senderEmail = handover.sender?.email;

    if (!senderEmail) {
      this.logger.warn(
        `Khong co email nguoi giao cho ban giao ${handover.id}, bo qua gui mail.`,
      );
      return;
    }

    const mail = buildHandoverChangesRequestedMail({
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

  private taskLabel(handover: ShiftHandover) {
    if (handover.task) {
      return `${handover.task.taskCode} - ${handover.task.title}`;
    }

    return handover.title ?? 'Cong viec';
  }

  private handoverUrl(handover: ShiftHandover) {
    const { appUrl } = mailConfig();

    return `${appUrl}/workspaces/${handover.workspaceId}/projects/${handover.projectId}/handovers`;
  }

  private formatDate(value: Date | null) {
    if (!value) {
      return null;
    }

    return new Date(value).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  }
}
