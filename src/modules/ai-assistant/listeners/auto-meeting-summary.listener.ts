import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { MeetingCompletedEvent } from '../../meetings/events/meeting-completed.event';
import { MeetingLifecycleService } from '../../meetings/services/meeting-lifecycle.service';
import { AiMeetingSummaryService } from '../services/ai-meeting-summary.service';

@Injectable()
export class AutoMeetingSummaryListener
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AutoMeetingSummaryListener.name);
  private unsubscribe?: () => boolean;

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
  }

  private async generateSummary(event: MeetingCompletedEvent) {
    try {
      await this.aiMeetingSummaryService.generateMeetingSummary(
        event.currentUserId,
        event.workspaceId,
        event.projectId,
        event.meetingId,
        { forceRegenerate: false },
      );
      this.logger.log(`Da tu dong tao tom tat cho cuoc hop ${event.meetingId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Khong the tu dong tao tom tat cho cuoc hop ${event.meetingId}: ${message}`,
      );
    }
  }
}
