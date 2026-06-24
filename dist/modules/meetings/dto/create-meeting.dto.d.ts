import { MeetingType } from '../../../common/enums/meeting-type.enum';
export declare class CreateMeetingDto {
    sprintId?: string | null;
    title: string;
    description?: string;
    meetingType?: MeetingType;
    meetingDate: string;
    startTime?: string | null;
    endTime?: string | null;
    participantIds?: string[];
}
