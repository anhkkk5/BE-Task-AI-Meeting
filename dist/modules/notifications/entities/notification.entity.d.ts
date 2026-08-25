import { User } from '../../users/entities/user.entity';
export declare enum NotificationType {
    TaskAssigned = "TASK_ASSIGNED",
    TaskMentioned = "TASK_MENTIONED",
    TaskDueSoon = "TASK_DUE_SOON",
    TaskOverdue = "TASK_OVERDUE",
    TaskBlockerResolved = "TASK_BLOCKER_RESOLVED",
    HandoverSubmitted = "HANDOVER_SUBMITTED",
    HandoverAccepted = "HANDOVER_ACCEPTED",
    HandoverRejected = "HANDOVER_REJECTED",
    HandoverChangesRequested = "HANDOVER_CHANGES_REQUESTED",
    MeetingInvited = "MEETING_INVITED",
    MeetingUpdated = "MEETING_UPDATED",
    MeetingCancelled = "MEETING_CANCELLED",
    DailyUpdateDraftReady = "DAILY_UPDATE_DRAFT_READY"
}
export declare class Notification {
    id: string;
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    link: string;
    metadata: Record<string, unknown> | null;
    idempotencyKey: string | null;
    readAt: Date | null;
    archivedAt: Date | null;
    recipient: User;
    createdAt: Date;
}
