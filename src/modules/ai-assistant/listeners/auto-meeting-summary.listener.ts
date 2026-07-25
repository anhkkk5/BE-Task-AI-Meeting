import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { MeetingCompletedEvent } from '../../meetings/events/meeting-completed.event';
import { MeetingLifecycleService } from '../../meetings/services/meeting-lifecycle.service';
import { AiMeetingSummaryService } from '../services/ai-meeting-summary.service';

/** So lan thu lai khi loi la loi ha tang (AI provider chet, Mongo loi). */
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 30_000;

@Injectable()
export class AutoMeetingSummaryListener
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AutoMeetingSummaryListener.name);
  private unsubscribe?: () => boolean;
  private readonly pendingRetries = new Set<NodeJS.Timeout>();

  constructor(
    private readonly meetingLifecycleService: MeetingLifecycleService,
    private readonly aiMeetingSummaryService: AiMeetingSummaryService,
  ) {}

  onModuleInit() {
    this.unsubscribe = this.meetingLifecycleService.onMeetingCompleted(
      (event) => this.generateSummary(event),
    );
  }

  onModuleDestroy() {
    this.unsubscribe?.();

    for (const timeout of this.pendingRetries) {
      clearTimeout(timeout);
    }

    this.pendingRetries.clear();
  }

  private async generateSummary(event: MeetingCompletedEvent, attempt = 1) {
    const source = event.reason === 'AUTO' ? 'tu dong' : 'thu cong';

    try {
      await this.aiMeetingSummaryService.generateMeetingSummary(
        event.currentUserId,
        event.workspaceId,
        event.projectId,
        event.meetingId,
        { forceRegenerate: false },
      );
      this.logger.log(
        `Da tao tom tat cho cuoc hop ${event.meetingId} (chot ${source})`,
      );
    } catch (error) {
      // Khong co bien ban la tinh huong binh thuong, khong phai loi he thong:
      // cuoc hop chi co transcript neu trong phong co nguoi bat ghi am.
      if (this.isMissingTranscript(error)) {
        this.logger.warn(
          `Bo qua tom tat cuoc hop ${event.meetingId}: chua co bien ban nao duoc ghi. ` +
            'Nguoi tham gia can bat ghi bien ban trong phong hop de AI co du lieu.',
        );
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Khong the tao tom tat cho cuoc hop ${event.meetingId} (lan ${attempt}/${MAX_RETRY_ATTEMPTS + 1}): ${message}`,
      );

      // Cuoc hop da COMPLETED nen du lieu khong mat, chi la tom tat ve muon.
      if (attempt <= MAX_RETRY_ATTEMPTS) {
        this.scheduleRetry(event, attempt + 1);
      }
    }
  }

  private scheduleRetry(event: MeetingCompletedEvent, nextAttempt: number) {
    const timeout = setTimeout(() => {
      this.pendingRetries.delete(timeout);
      void this.generateSummary(event, nextAttempt);
    }, RETRY_DELAY_MS);

    // unref de tien trinh Node khong bi giu song chi vi mot lan thu lai.
    timeout.unref?.();
    this.pendingRetries.add(timeout);
    this.logger.log(
      `Se thu tao lai tom tat cuoc hop ${event.meetingId} sau ${RETRY_DELAY_MS / 1000} giay`,
    );
  }

  private isMissingTranscript(error: unknown) {
    if (error instanceof NotFoundException) {
      return true;
    }

    const message = error instanceof Error ? error.message : String(error);

    return /transcript/i.test(message) && /not found|khong tim thay/i.test(message);
  }
}
