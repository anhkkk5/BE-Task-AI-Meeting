import { Injectable, Logger } from '@nestjs/common';
import { AiReportEvent } from '../events/ai-report.event';

type AiReportListener = (event: AiReportEvent) => void | Promise<void>;

/**
 * Phat su kien bao cao AI cho cac listener trong ung dung.
 *
 * Sao lai cau truc cua HandoverEventsService de nhat quan voi cach du an dang
 * lam, thay vi them @nestjs/event-emitter chi cho mot cho.
 *
 * Listener duoc goi khong cho await va moi loi deu bi chan lai o day, nen SMTP
 * chet cung khong lam that bai viec duyet bao cao.
 */
@Injectable()
export class AiReportEventsService {
  private readonly logger = new Logger(AiReportEventsService.name);
  private readonly listeners = new Set<AiReportListener>();

  onAiReportEvent(listener: AiReportListener) {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  publish(event: AiReportEvent) {
    for (const listener of this.listeners) {
      void Promise.resolve(listener(event)).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Xu ly su kien bao cao AI "${event.type}" that bai: ${message}`,
        );
      });
    }
  }
}
