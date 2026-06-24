import type { AuthUser } from '../../auth/types/auth-user.type';
import { AddMeetingParticipantsDto } from '../dto/add-meeting-participants.dto';
import { UpdateParticipantAttendanceDto } from '../dto/update-participant-attendance.dto';
import { MeetingParticipantsService } from '../services/meeting-participants.service';
export declare class MeetingParticipantsController {
    private readonly meetingParticipantsService;
    constructor(meetingParticipantsService: MeetingParticipantsService);
    addParticipants(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, dto: AddMeetingParticipantsDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                participantId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: import("../../../common/enums/meeting-participant-role.enum").MeetingParticipantRole;
                attended: boolean;
            }[];
        };
    }>;
    getParticipants(user: AuthUser, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                participantId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: import("../../../common/enums/meeting-participant-role.enum").MeetingParticipantRole;
                attended: boolean;
            }[];
        };
    }>;
    updateAttendance(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, participantId: string, dto: UpdateParticipantAttendanceDto): Promise<{
        success: boolean;
        message: string;
        data: {
            participant: {
                participantId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: import("../../../common/enums/meeting-participant-role.enum").MeetingParticipantRole;
                attended: boolean;
            };
        };
    }>;
}
