import { MeetingActionItemReviewStatus } from '../../../common/enums/meeting-action-item-review-status.enum';
export declare class MeetingActionItemReview {
    id: string;
    workspaceId: string;
    projectId: string;
    meetingId: string;
    summaryId: string;
    actionItemIndex: number;
    actionItemText: string;
    suggestedAssigneeName: string | null;
    suggestedDueDate: string | null;
    status: MeetingActionItemReviewStatus;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    createdTaskId: string | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}
