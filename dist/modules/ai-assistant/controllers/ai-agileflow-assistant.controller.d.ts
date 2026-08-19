import type { AuthUser } from '../../auth/types/auth-user.type';
import { AskAgileFlowAssistantDto } from '../dto/ask-agileflow-assistant.dto';
import { AiAgileFlowAssistantService } from '../services/ai-agileflow-assistant.service';
export declare class AiAgileFlowAssistantController {
    private readonly service;
    constructor(service: AiAgileFlowAssistantService);
    ask(user: AuthUser, dto: AskAgileFlowAssistantDto): Promise<{
        success: boolean;
        message: string;
        data: {
            answer: string;
            suggestedQuestions: string[];
            sources: never[];
            state: "GLOBAL" | "NEED_WORKSPACE" | "NEED_PROJECT" | "NEED_SPRINT" | "READY";
            choices: {
                id: string;
                label: string;
                description?: string;
            }[];
            scope: {
                workspaceId: null;
                projectId: null;
                sprintId: null;
            };
        };
    } | {
        success: boolean;
        message: string;
        data: {
            answer: string;
            suggestedQuestions: never[];
            sources: never[];
            state: "GLOBAL" | "NEED_WORKSPACE" | "NEED_PROJECT" | "NEED_SPRINT" | "READY";
            choices: {
                id: string;
                label: string;
                description?: string;
            }[];
            scope: {};
        };
    } | {
        data: {
            state: "GLOBAL" | "NEED_WORKSPACE" | "NEED_PROJECT" | "NEED_SPRINT" | "READY";
            choices: {
                id: string;
                label: string;
                description?: string;
            }[];
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
        success: boolean;
        message: string;
    }>;
}
