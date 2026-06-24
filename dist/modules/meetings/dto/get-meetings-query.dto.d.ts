import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';
export declare class GetMeetingsQueryDto {
    status?: MeetingStatus;
    meetingType?: MeetingType;
    sprintId?: string;
    fromDate?: string;
    toDate?: string;
    keyword?: string;
    page?: number;
    limit?: number;
}
