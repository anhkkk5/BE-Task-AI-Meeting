import { DailyUpdate } from '../../daily-updates/entities/daily-update.entity';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { SprintsRepository } from '../../sprints/repositories/sprints.repository';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { Task } from '../../tasks/entities/task.entity';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AskProjectAssistantDto } from '../dto/ask-project-assistant.dto';
import { AiProviderService } from './ai-provider.service';
export type SprintRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskSeverity = 'INFO' | 'WARNING' | 'DANGER';
export type SprintRiskAssessment = {
    sprint: Pick<Sprint, 'id' | 'name' | 'goal' | 'status' | 'startDate' | 'endDate'>;
    score: number;
    level: SprintRiskLevel;
    levelLabel: string;
    summary: string;
    metrics: {
        totalTasks: number;
        completedTasks: number;
        remainingTasks: number;
        completionRate: number;
        overdueTasks: number;
        unassignedTasks: number;
        staleTasks: number;
        blockedMembers: number;
        remainingDays: number;
        elapsedPercent: number;
        expectedProgress: number;
        workloadHoursRemaining: number;
        storyPointsRemaining: number;
    };
    signals: {
        code: string;
        severity: RiskSeverity;
        title: string;
        detail: string;
        taskIds: string[];
    }[];
    recommendations: string[];
    generatedAt: string;
};
type AssistantSource = {
    type: 'PROJECT' | 'SPRINT' | 'TASK' | 'DAILY_UPDATE';
    id: string;
    label: string;
    detail: string;
};
export declare class AiProjectAssistantService {
    private readonly aiProviderService;
    private readonly dailyUpdatesRepository;
    private readonly projectAccessService;
    private readonly projectsRepository;
    private readonly sprintAccessService;
    private readonly sprintsRepository;
    private readonly tasksRepository;
    private readonly workspaceAccessService;
    constructor(aiProviderService: AiProviderService, dailyUpdatesRepository: DailyUpdatesRepository, projectAccessService: ProjectAccessService, projectsRepository: ProjectsRepository, sprintAccessService: SprintAccessService, sprintsRepository: SprintsRepository, tasksRepository: TasksRepository, workspaceAccessService: WorkspaceAccessService);
    ask(userId: string, workspaceId: string, projectId: string, dto: AskProjectAssistantDto): Promise<{
        success: boolean;
        message: string;
        data: {
            answer: string;
            sources: AssistantSource[];
            suggestedQuestions: string[];
            sprintRisk: {
                score: number;
                level: SprintRiskLevel;
                levelLabel: string;
            } | undefined;
            scope: {
                sprintId: string | null;
                sprintName: string | null;
            };
        };
    }>;
    getSprintRisk(userId: string, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: SprintRiskAssessment;
    }>;
    buildRiskAssessment(sprint: Sprint, sprintTasks: Task[], updates: DailyUpdate[], now?: Date): SprintRiskAssessment;
    private assertAccess;
    private findDefaultSprint;
    private buildFallbackAnswer;
    private buildSources;
    private buildPrompt;
    private calculateSchedule;
    private resolveRiskLevel;
    private buildRecommendations;
    private toUtcDate;
    private startOfUtcDay;
}
export {};
