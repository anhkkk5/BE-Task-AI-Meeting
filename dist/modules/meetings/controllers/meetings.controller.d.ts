import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { GetMeetingsQueryDto } from '../dto/get-meetings-query.dto';
import { UpdateMeetingDto } from '../dto/update-meeting.dto';
import { MeetingsService } from '../services/meetings.service';
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    createMeeting(user: AuthUser, workspaceId: string, projectId: string, dto: CreateMeetingDto): Promise<{
        success: boolean;
        message: string;
        data: {
            meeting: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                title: string;
                description: string | null;
                meetingType: import("../../../common/enums/meeting-type.enum").MeetingType;
                meetingDate: string;
                startTime: Date | null;
                endTime: Date | null;
                status: import("../../../common/enums/meeting-status.enum").MeetingStatus;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                participants: {
                    participantId: string;
                    userId: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                    role: import("../../../common/enums/meeting-participant-role.enum").MeetingParticipantRole;
                    attended: boolean;
                }[];
                mongoTranscriptId: string | null;
                mongoSummaryId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getMeetings(user: AuthUser, workspaceId: string, projectId: string, query: GetMeetingsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                title: string;
                description: string | null;
                meetingType: import("../../../common/enums/meeting-type.enum").MeetingType;
                meetingDate: string;
                startTime: Date | null;
                endTime: Date | null;
                status: import("../../../common/enums/meeting-status.enum").MeetingStatus;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                participants: {
                    participantId: string;
                    userId: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                    role: import("../../../common/enums/meeting-participant-role.enum").MeetingParticipantRole;
                    attended: boolean;
                }[];
                mongoTranscriptId: string | null;
                mongoSummaryId: string | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
    getMeetingDetail(user: AuthUser, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            meeting: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                title: string;
                description: string | null;
                meetingType: import("../../../common/enums/meeting-type.enum").MeetingType;
                meetingDate: string;
                startTime: Date | null;
                endTime: Date | null;
                status: import("../../../common/enums/meeting-status.enum").MeetingStatus;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                participants: {
                    participantId: string;
                    userId: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                    role: import("../../../common/enums/meeting-participant-role.enum").MeetingParticipantRole;
                    attended: boolean;
                }[];
                mongoTranscriptId: string | null;
                mongoSummaryId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateMeeting(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, dto: UpdateMeetingDto): Promise<{
        success: boolean;
        message: string;
        data: {
            meeting: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                title: string;
                description: string | null;
                meetingType: import("../../../common/enums/meeting-type.enum").MeetingType;
                meetingDate: string;
                startTime: Date | null;
                endTime: Date | null;
                status: import("../../../common/enums/meeting-status.enum").MeetingStatus;
                createdBy: string;
                creator: {
                    id: string;
                    fullName: string;
                    email: string;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                participants: {
                    participantId: string;
                    userId: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                    role: import("../../../common/enums/meeting-participant-role.enum").MeetingParticipantRole;
                    attended: boolean;
                }[];
                mongoTranscriptId: string | null;
                mongoSummaryId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    cancelMeeting(user: AuthUser, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    completeMeeting(user: AuthUser, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
