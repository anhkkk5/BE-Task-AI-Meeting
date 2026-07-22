import { Injectable, Logger } from '@nestjs/common';
import { MeetingCompletedEvent } from '../events/meeting-completed.event';

type MeetingCompletedListener = (
  event: MeetingCompletedEvent,
) => void | Promise<void>;

@Injectable()
export class MeetingLifecycleService {
  private readonly logger = new Logger(MeetingLifecycleService.name);
  private readonly completedListeners = new Set<MeetingCompletedListener>();

  onMeetingCompleted(listener: MeetingCompletedListener) {
    this.completedListeners.add(listener);

    return () => this.completedListeners.delete(listener);
  }

  publishMeetingCompleted(event: MeetingCompletedEvent) {
    for (const listener of this.completedListeners) {
      void Promise.resolve(listener(event)).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Xu ly su kien ket thuc cuoc hop that bai: ${message}`,
        );
      });
    }
  }
}
