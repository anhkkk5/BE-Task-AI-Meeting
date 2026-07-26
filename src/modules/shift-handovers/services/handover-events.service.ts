import { Injectable, Logger } from '@nestjs/common';
import { HandoverEvent } from '../events/handover.event';

type HandoverListener = (event: HandoverEvent) => void | Promise<void>;

/**
 * Phat su kien vong doi ban giao cho cac listener trong ung dung.
 *
 * Sao lai cau truc cua MeetingLifecycleService de nhat quan voi cach du an dang
 * lam, thay vi them @nestjs/event-emitter chi cho mot cho.
 *
 * Diem quan trong: listener duoc goi khong cho await va moi loi deu bi chan lai
 * o day. Nho vay SMTP chet cung khong the lam that bai nghiep vu ban giao.
 */
@Injectable()
export class HandoverEventsService {
  private readonly logger = new Logger(HandoverEventsService.name);
  private readonly listeners = new Set<HandoverListener>();

  onHandoverEvent(listener: HandoverListener) {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  publish(event: HandoverEvent) {
    for (const listener of this.listeners) {
      void Promise.resolve(listener(event)).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Xu ly su kien ban giao "${event.type}" that bai: ${message}`,
        );
      });
    }
  }
}
