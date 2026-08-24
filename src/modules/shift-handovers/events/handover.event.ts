import { ShiftHandover } from '../entities/shift-handover.entity';

export type HandoverEventType =
  'submitted' | 'accepted' | 'rejected' | 'changes_requested';

/**
 * Su kien vong doi ban giao cong viec.
 *
 * Mang theo ca entity da load quan he sender/receiver/task de listener khong
 * phai truy van lai database chi de lay email va ten nguoi lien quan.
 */
export type HandoverEvent = {
  type: HandoverEventType;
  handover: ShiftHandover;
  /** Ly do tu choi hoac noi dung can bo sung, tuy loai su kien. */
  reason?: string | null;
};
