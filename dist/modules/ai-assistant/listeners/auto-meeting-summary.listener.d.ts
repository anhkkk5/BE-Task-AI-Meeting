import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MeetingLifecycleService } from '../../meetings/services/meeting-lifecycle.service';
import { AiMeetingSummaryService } from '../services/ai-meeting-summary.service';
export declare class AutoMeetingSummaryListener implements OnModuleInit, OnModuleDestroy {
    private readonly meetingLifecycleService;
    private readonly aiMeetingSummaryService;
    private readonly logger;
    private unsubscribe?;
    constructor(meetingLifecycleService: MeetingLifecycleService, aiMeetingSummaryService: AiMeetingSummaryService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private generateSummary;
}
