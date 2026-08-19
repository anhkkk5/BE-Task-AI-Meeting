import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { SprintsRepository } from '../../sprints/repositories/sprints.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { AskAgileFlowAssistantDto } from '../dto/ask-agileflow-assistant.dto';
import { AiProjectAssistantService } from './ai-project-assistant.service';
import { AiProviderService } from './ai-provider.service';
type ContextState = 'GLOBAL' | 'NEED_WORKSPACE' | 'NEED_PROJECT' | 'NEED_SPRINT' | 'READY';
type ContextChoice = {
    id: string;
    label: string;
    description?: string;
};
export declare class AiAgileFlowAssistantService {
    private readonly workspaceMembersRepository;
    private readonly projectsRepository;
    private readonly sprintsRepository;
    private readonly projectAssistantService;
    private readonly aiProviderService;
    constructor(workspaceMembersRepository: WorkspaceMembersRepository, projectsRepository: ProjectsRepository, sprintsRepository: SprintsRepository, projectAssistantService: AiProjectAssistantService, aiProviderService: AiProviderService);
    ask(userId: string, dto: AskAgileFlowAssistantDto): Promise<{
        success: boolean;
        message: string;
        data: {
            answer: string;
            suggestedQuestions: string[];
            sources: never[];
            state: ContextState;
            choices: ContextChoice[];
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
            state: ContextState;
            choices: ContextChoice[];
            scope: {};
        };
    } | {
        data: {
            state: ContextState;
            choices: ContextChoice[];
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
                level: import("./ai-project-assistant.service").SprintRiskLevel;
                levelLabel: string;
            } | undefined;
            scope: {
                sprintId: string | null;
                sprintName: string | null;
            };
            actionDraft: import("./ai-project-assistant.service").ProjectAssistantActionDraft | undefined;
        };
        success: boolean;
        message: string;
    }>;
    private answerFeatureQuestion;
    private choiceResponse;
    private isFeatureQuestion;
    private needsSprint;
    private normalize;
    private assertWorkspaceMembership;
    private sprintStatusLabel;
}
export {};
