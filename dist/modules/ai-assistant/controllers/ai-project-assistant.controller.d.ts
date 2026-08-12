import type { AuthUser } from '../../auth/types/auth-user.type';
import { AskProjectAssistantDto } from '../dto/ask-project-assistant.dto';
import { AiProjectAssistantService } from '../services/ai-project-assistant.service';
export declare class AiProjectAssistantController {
    private readonly aiProjectAssistantService;
    constructor(aiProjectAssistantService: AiProjectAssistantService);
    ask(user: AuthUser, workspaceId: string, projectId: string, dto: AskProjectAssistantDto): Promise<{
        success: boolean;
        message: string;
        data: {
            answer: string;
            sources: {
                type: "PROJECT" | "SPRINT" | "TASK" | "DAILY_UPDATE";
                id: string;
                label: string;
                detail: string;
            }[];
            suggestedQuestions: string[];
            sprintRisk: {
                score: number;
                level: import("../services/ai-project-assistant.service").SprintRiskLevel;
                levelLabel: string;
            } | undefined;
            scope: {
                sprintId: string | null;
                sprintName: string | null;
            };
            actionDraft: import("../services/ai-project-assistant.service").ProjectAssistantActionDraft | undefined;
        };
    }>;
    getHistory(user: AuthUser, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: any;
                role: any;
                content: any;
                sources: any;
                actionDraft: any;
                createdAt: any;
            }[];
        };
    }>;
    clearHistory(user: AuthUser, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getSprintRisk(user: AuthUser, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../services/ai-project-assistant.service").SprintRiskAssessment;
    }>;
}
