import { MeetingCompletedEvent } from '../../meetings/events/meeting-completed.event';
import { MeetingLifecycleService } from '../../meetings/services/meeting-lifecycle.service';
import { AiMeetingSummaryService } from '../services/ai-meeting-summary.service';
import { AutoMeetingSummaryListener } from './auto-meeting-summary.listener';

describe('AutoMeetingSummaryListener', () => {
  let completedHandler:
    ((event: MeetingCompletedEvent) => void | Promise<void>) | undefined;
  let unsubscribe: jest.Mock;
  let meetingLifecycleService: jest.Mocked<
    Pick<MeetingLifecycleService, 'onMeetingCompleted'>
  >;
  let aiMeetingSummaryService: jest.Mocked<
    Pick<AiMeetingSummaryService, 'generateMeetingSummary'>
  >;
  let listener: AutoMeetingSummaryListener;

  const event: MeetingCompletedEvent = {
    currentUserId: 'owner-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    meetingId: 'meeting-id',
    reason: 'MANUAL',
  };

  beforeEach(() => {
    unsubscribe = jest.fn();
    meetingLifecycleService = {
      onMeetingCompleted: jest.fn((handler) => {
        completedHandler = handler;
        return unsubscribe;
      }),
    };
    aiMeetingSummaryService = {
      generateMeetingSummary: jest.fn().mockResolvedValue({
        success: true,
        message: 'Generate meeting summary successfully',
        data: { summary: {} },
      }),
    };
    listener = new AutoMeetingSummaryListener(
      meetingLifecycleService as unknown as MeetingLifecycleService,
      aiMeetingSummaryService as unknown as AiMeetingSummaryService,
    );
  });

  it('generates a non-duplicated summary when meeting is completed', async () => {
    listener.onModuleInit();

    await completedHandler?.(event);

    expect(aiMeetingSummaryService.generateMeetingSummary).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
      'project-id',
      'meeting-id',
      { forceRegenerate: false },
    );
  });

  it('unsubscribes when module is destroyed', () => {
    listener.onModuleInit();
    listener.onModuleDestroy();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
