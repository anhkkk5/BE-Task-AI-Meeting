import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MeetingLifecycleService } from '../../meetings/services/meeting-lifecycle.service';
import { AiMeetingSummaryService } from '../services/ai-meeting-summary.service';
import { AiPersonalizedMeetingSummaryService } from '../services/ai-personalized-meeting-summary.service';
export declare class AutoMeetingSummaryListener implements OnModuleInit, OnModuleDestroy {
    private readonly meetingLifecycleService;
    private readonly aiMeetingSummaryService;
    private readonly personalizedMeetingSummaryService;
    private readonly logger;
    private unsubscribe?;
    private readonly pendingRetries;
    constructor(meetingLifecycleService: MeetingLifecycleService, aiMeetingSummaryService: AiMeetingSummaryService, personalizedMeetingSummaryService: AiPersonalizedMeetingSummaryService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private generateSummary;
    private scheduleRetry;
    private isMissingTranscript;
}
