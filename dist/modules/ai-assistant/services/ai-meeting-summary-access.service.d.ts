import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
export declare class AiMeetingSummaryAccessService {
    private readonly meetingParticipantsRepository;
    private readonly workspaceAccessService;
    constructor(meetingParticipantsRepository: MeetingParticipantsRepository, workspaceAccessService: WorkspaceAccessService);
    assertCanGenerateSummary(userId: string, workspaceId: string): Promise<WorkspaceRole>;
    assertCanViewSummary(userId: string, workspaceId: string, meetingId: string): Promise<WorkspaceRole.Owner | WorkspaceRole.ScrumMaster | WorkspaceRole.ProjectManager | WorkspaceRole.Member>;
}
