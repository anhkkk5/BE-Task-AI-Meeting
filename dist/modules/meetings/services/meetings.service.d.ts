import { DataSource } from 'typeorm';
import { MeetingParticipantRole } from '../../../common/enums/meeting-participant-role.enum';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { GetMeetingsQueryDto } from '../dto/get-meetings-query.dto';
import { UpdateMeetingDto } from '../dto/update-meeting.dto';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingAccessService } from './meeting-access.service';
import { MeetingLifecycleService } from './meeting-lifecycle.service';
export declare class MeetingsService {
    private readonly dataSource;
    private readonly meetingsRepository;
    private readonly meetingParticipantsRepository;
    private readonly meetingAccessService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    private readonly sprintAccessService;
    private readonly meetingLifecycleService;
    constructor(dataSource: DataSource, meetingsRepository: MeetingsRepository, meetingParticipantsRepository: MeetingParticipantsRepository, meetingAccessService: MeetingAccessService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService, sprintAccessService: SprintAccessService, meetingLifecycleService: MeetingLifecycleService);
    createMeeting(currentUserId: string, workspaceId: string, projectId: string, dto: CreateMeetingDto): Promise<{
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
                meetingType: MeetingType;
                meetingDate: string;
                startTime: Date | null;
                endTime: Date | null;
                status: MeetingStatus;
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
                    role: MeetingParticipantRole;
                    attended: boolean;
                }[];
                mongoTranscriptId: string | null;
                mongoSummaryId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getMeetings(currentUserId: string, workspaceId: string, projectId: string, query: GetMeetingsQueryDto): Promise<{
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
                meetingType: MeetingType;
                meetingDate: string;
                startTime: Date | null;
                endTime: Date | null;
                status: MeetingStatus;
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
                    role: MeetingParticipantRole;
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
    getMeetingDetail(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
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
                meetingType: MeetingType;
                meetingDate: string;
                startTime: Date | null;
                endTime: Date | null;
                status: MeetingStatus;
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
                    role: MeetingParticipantRole;
                    attended: boolean;
                }[];
                mongoTranscriptId: string | null;
                mongoSummaryId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateMeeting(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, dto: UpdateMeetingDto): Promise<{
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
                meetingType: MeetingType;
                meetingDate: string;
                startTime: Date | null;
                endTime: Date | null;
                status: MeetingStatus;
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
                    role: MeetingParticipantRole;
                    attended: boolean;
                }[];
                mongoTranscriptId: string | null;
                mongoSummaryId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    cancelMeeting(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    completeMeeting(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    deleteMeeting(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    private changeMeetingStatus;
    private assertValidMeetingFilters;
    private assertSprintFilter;
    private assertParticipantsInWorkspace;
    private assertTimeRange;
    private uniqueUserIds;
    private normalizeDate;
    private optionalText;
    private toDateOrNull;
    private toParticipantResponse;
    private toMeetingResponse;
}
