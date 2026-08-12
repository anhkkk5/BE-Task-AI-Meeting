import { NotificationsService } from '../../notifications/notifications.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { TasksService } from '../../tasks/services/tasks.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { SaveAutomationRuleDto } from '../dto/save-automation-rule.dto';
import { AutomationRule } from '../entities/automation-rule.entity';
import { AutomationRepository } from '../repositories/automation.repository';
export declare class AutomationService {
    private repo;
    private tasksRepo;
    private tasks;
    private notifications;
    private projects;
    private workspaces;
    constructor(repo: AutomationRepository, tasksRepo: TasksRepository, tasks: TasksService, notifications: NotificationsService, projects: ProjectAccessService, workspaces: WorkspaceAccessService);
    list(userId: string, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: AutomationRule[];
        };
    }>;
    save(userId: string, workspaceId: string, projectId: string, dto: SaveAutomationRuleDto, id?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            rule: AutomationRule;
        };
    }>;
    remove(userId: string, workspaceId: string, projectId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    preview(userId: string, workspaceId: string, projectId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            matchedTasks: {
                id: string;
                taskCode: string;
                title: string;
            }[];
            plannedActions: {
                type: "NOTIFY_ASSIGNEE" | "CHANGE_STATUS" | "ASSIGN_USER";
                value?: string;
                message?: string;
            }[];
            count: number;
        };
    }>;
    history(userId: string, workspaceId: string, projectId: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: import("../entities/automation-run.entity").AutomationRun[];
        };
    }>;
    runRule(rule: AutomationRule, forceRetry?: number): Promise<import("../entities/automation-run.entity").AutomationRun[]>;
    retry(userId: string, workspaceId: string, projectId: string, runId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            run: import("../entities/automation-run.entity").AutomationRun;
        };
    }>;
    private execute;
    private matches;
    private validate;
    private requireRule;
    private access;
}
