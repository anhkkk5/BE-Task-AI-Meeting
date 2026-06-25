import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AiReportDocument } from '../schemas/ai-report.schema';
export declare class AiReportAccessService {
    private readonly workspaceAccessService;
    constructor(workspaceAccessService: WorkspaceAccessService);
    assertCanUseOwnReports(userId: string, workspaceId: string): Promise<WorkspaceRole>;
    assertCanManageMemberReports(userId: string, workspaceId: string): Promise<WorkspaceRole>;
    assertCanViewReport(currentUserId: string, workspaceId: string, report: AiReportDocument): Promise<WorkspaceRole>;
    isManagerRole(role: WorkspaceRole | string | null): boolean;
}
