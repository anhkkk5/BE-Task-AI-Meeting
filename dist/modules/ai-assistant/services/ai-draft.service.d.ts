import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { AiUserPreferencesService } from '../../users/services/ai-user-preferences.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { DraftDailyUpdateDto } from '../dto/draft-daily-update.dto';
import { DraftHandoverDto } from '../dto/draft-handover.dto';
import { AiProviderService } from './ai-provider.service';
import { AiReportDataBuilderService } from './ai-report-data-builder.service';
import { PromptBuilderService } from './prompt-builder.service';
export declare class AiDraftService {
    private readonly aiProviderService;
    private readonly dataBuilderService;
    private readonly promptBuilderService;
    private readonly projectAccessService;
    private readonly workspaceAccessService;
    private readonly tasksRepository;
    private readonly dailyUpdatesRepository;
    private readonly aiUserPreferencesService;
    constructor(aiProviderService: AiProviderService, dataBuilderService: AiReportDataBuilderService, promptBuilderService: PromptBuilderService, projectAccessService: ProjectAccessService, workspaceAccessService: WorkspaceAccessService, tasksRepository: TasksRepository, dailyUpdatesRepository: DailyUpdatesRepository, aiUserPreferencesService: AiUserPreferencesService);
    draftMyDailyUpdate(currentUserId: string, workspaceId: string, projectId: string, dto: DraftDailyUpdateDto): Promise<{
        success: boolean;
        message: string;
        data: {
            draft: import("../types/ai-draft.type").DailyUpdateDraftOutput;
            model: string;
        };
    }>;
    draftHandover(currentUserId: string, workspaceId: string, projectId: string, dto: DraftHandoverDto): Promise<{
        success: boolean;
        message: string;
        data: {
            draft: import("../types/ai-draft.type").HandoverDraftOutput;
            model: string;
        };
    }>;
}
