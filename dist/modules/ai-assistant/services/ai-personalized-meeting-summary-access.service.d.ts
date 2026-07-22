import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { PersonalizedMeetingSummaryDocument } from '../schemas/personalized-meeting-summary.schema';
export declare class AiPersonalizedMeetingSummaryAccessService {
    private readonly meetingParticipantsRepository;
    private readonly workspaceAccessService;
    constructor(meetingParticipantsRepository: MeetingParticipantsRepository, workspaceAccessService: WorkspaceAccessService);
    assertCanUseOwnSummary(userId: string, workspaceId: string, meetingId: string): Promise<WorkspaceRole.Owner | WorkspaceRole.ScrumMaster | WorkspaceRole.ProjectManager | WorkspaceRole.Member>;
    assertCanManageMemberSummary(userId: string, workspaceId: string): Promise<WorkspaceRole>;
    assertCanViewSummary(currentUserId: string, workspaceId: string, summary: PersonalizedMeetingSummaryDocument): Promise<WorkspaceRole.Owner | WorkspaceRole.ScrumMaster | WorkspaceRole.ProjectManager | WorkspaceRole.Member>;
    assertTargetParticipant(meetingId: string, targetUserId: string): Promise<import("../../meetings/entities/meeting-participant.entity").MeetingParticipant>;
    isManagerRole(role: WorkspaceRole | string | null): boolean;
    private assertParticipant;
}
