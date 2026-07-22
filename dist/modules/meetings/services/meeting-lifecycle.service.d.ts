import { MeetingCompletedEvent } from '../events/meeting-completed.event';
type MeetingCompletedListener = (event: MeetingCompletedEvent) => void | Promise<void>;
export declare class MeetingLifecycleService {
    private readonly logger;
    private readonly completedListeners;
    onMeetingCompleted(listener: MeetingCompletedListener): () => boolean;
    publishMeetingCompleted(event: MeetingCompletedEvent): void;
}
export {};
