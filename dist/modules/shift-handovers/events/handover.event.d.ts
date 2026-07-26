import { ShiftHandover } from '../entities/shift-handover.entity';
export type HandoverEventType = 'submitted' | 'accepted' | 'rejected' | 'changes_requested';
export type HandoverEvent = {
    type: HandoverEventType;
    handover: ShiftHandover;
    reason?: string | null;
};
