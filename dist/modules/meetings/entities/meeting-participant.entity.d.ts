import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { User } from '../../users/entities/user.entity';
import { Meeting } from './meeting.entity';
export declare class MeetingParticipant {
    id: string;
    meetingId: string;
    userId: string;
    role: MeetingParticipantRole;
    attended: boolean;
    meeting: Meeting;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
