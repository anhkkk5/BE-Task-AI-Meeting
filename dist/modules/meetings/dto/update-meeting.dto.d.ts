import { MeetingType } from '../../../common/enums/meeting-type.enum';
export declare class UpdateMeetingDto {
    sprintId?: string | null;
    title?: string;
    description?: string | null;
    meetingType?: MeetingType;
    meetingDate?: string;
    startTime?: string | null;
    endTime?: string | null;
}
