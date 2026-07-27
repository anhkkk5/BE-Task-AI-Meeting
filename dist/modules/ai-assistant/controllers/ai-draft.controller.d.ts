import type { AuthUser } from '../../auth/types/auth-user.type';
import { DraftDailyUpdateDto } from '../dto/draft-daily-update.dto';
import { DraftHandoverDto } from '../dto/draft-handover.dto';
import { AiDraftService } from '../services/ai-draft.service';
export declare class AiDraftController {
    private readonly aiDraftService;
    constructor(aiDraftService: AiDraftService);
    draftMyDailyUpdate(user: AuthUser, workspaceId: string, projectId: string, dto: DraftDailyUpdateDto): Promise<{
        success: boolean;
        message: string;
        data: {
            draft: import("../types/ai-draft.type").DailyUpdateDraftOutput;
            model: string;
        };
    }>;
    draftHandover(user: AuthUser, workspaceId: string, projectId: string, dto: DraftHandoverDto): Promise<{
        success: boolean;
        message: string;
        data: {
            draft: import("../types/ai-draft.type").HandoverDraftOutput;
            model: string;
        };
    }>;
}
