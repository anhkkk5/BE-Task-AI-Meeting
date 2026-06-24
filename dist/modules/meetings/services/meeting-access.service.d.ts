import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Meeting } from '../entities/meeting.entity';
import { MeetingsRepository } from '../repositories/meetings.repository';
export declare class MeetingAccessService {
    private readonly meetingsRepository;
    private readonly workspaceAccessService;
    constructor(meetingsRepository: MeetingsRepository, workspaceAccessService: WorkspaceAccessService);
    getMeetingInProject(meetingId: string, projectId: string): Promise<Meeting | null>;
    assertMeetingInProject(meetingId: string, projectId: string): Promise<Meeting>;
    assertMeetingEditable(meeting: Meeting): void;
    assertUserCanManageMeeting(userId: string, workspaceId: string): Promise<WorkspaceRole>;
    assertUserCanViewMeeting(userId: string, workspaceId: string): Promise<import("../../workspaces/entities/workspace-member.entity").WorkspaceMember>;
    isMeetingManager(userId: string, workspaceId: string): Promise<boolean>;
}
