/** Nguon goc su kien chot cuoc hop. */
export type MeetingCompletedReason = 'MANUAL' | 'AUTO';

export type MeetingCompletedEvent = {
  currentUserId: string;
  workspaceId: string;
  projectId: string;
  meetingId: string;
  reason: MeetingCompletedReason;
};
