import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AddMeetingParticipantsDto } from '../dto/add-meeting-participants.dto';
import { UpdateParticipantAttendanceDto } from '../dto/update-participant-attendance.dto';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingAccessService } from './meeting-access.service';
export declare class MeetingParticipantsService {
    private readonly meetingParticipantsRepository;
    private readonly meetingAccessService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    private readonly notificationsService?;
    constructor(meetingParticipantsRepository: MeetingParticipantsRepository, meetingAccessService: MeetingAccessService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService, notificationsService?: NotificationsService | undefined);
    addParticipants(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, dto: AddMeetingParticipantsDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                participantId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: MeetingParticipantRole;
                attended: boolean;
            }[];
        };
    }>;
    getParticipants(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                participantId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: MeetingParticipantRole;
                attended: boolean;
            }[];
        };
    }>;
    updateAttendance(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, participantId: string, dto: UpdateParticipantAttendanceDto): Promise<{
        success: boolean;
        message: string;
        data: {
            participant: {
                participantId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: MeetingParticipantRole;
                attended: boolean;
            };
        };
    }>;
    private assertParticipantInMeeting;
    private assertCanUpdateAttendance;
    private assertParticipantsInWorkspace;
    private deduplicateParticipants;
    private toParticipantResponse;
}
