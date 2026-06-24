import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
export declare class AddMeetingParticipantItemDto {
    userId: string;
    role?: MeetingParticipantRole;
}
export declare class AddMeetingParticipantsDto {
    participants: AddMeetingParticipantItemDto[];
}
