import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { DailyUpdate } from '../entities/daily-update.entity';
import { DailyUpdatesRepository } from '../repositories/daily-updates.repository';
export declare class DailyUpdateAccessService {
    private readonly dailyUpdatesRepository;
    private readonly workspaceAccessService;
    constructor(dailyUpdatesRepository: DailyUpdatesRepository, workspaceAccessService: WorkspaceAccessService);
    getDailyUpdateInProject(dailyUpdateId: string, projectId: string): Promise<DailyUpdate | null>;
    assertDailyUpdateInProject(dailyUpdateId: string, projectId: string): Promise<DailyUpdate>;
    assertCanViewDailyUpdate(currentUserId: string, workspaceId: string, dailyUpdate: DailyUpdate): Promise<void>;
    assertCanEditDailyUpdate(currentUserId: string, dailyUpdate: DailyUpdate): void;
    assertCanWriteDailyUpdate(currentUserId: string, workspaceId: string): Promise<WorkspaceRole>;
    assertCanViewTeamDailyUpdates(currentUserId: string, workspaceId: string): Promise<WorkspaceRole>;
}
