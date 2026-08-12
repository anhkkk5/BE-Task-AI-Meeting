import type { AuthUser } from '../../auth/types/auth-user.type';
import { SaveAutomationRuleDto } from '../dto/save-automation-rule.dto';
import { AutomationService } from '../services/automation.service';
export declare class AutomationController {
    private service;
    constructor(service: AutomationService);
    list(u: AuthUser, w: string, p: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: import("../entities/automation-rule.entity").AutomationRule[];
        };
    }>;
    create(u: AuthUser, w: string, p: string, dto: SaveAutomationRuleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            rule: import("../entities/automation-rule.entity").AutomationRule;
        };
    }>;
    update(u: AuthUser, w: string, p: string, id: string, dto: SaveAutomationRuleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            rule: import("../entities/automation-rule.entity").AutomationRule;
        };
    }>;
    remove(u: AuthUser, w: string, p: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    preview(u: AuthUser, w: string, p: string, id: string): Promise<{
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
    history(u: AuthUser, w: string, p: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: import("../entities/automation-run.entity").AutomationRun[];
        };
    }>;
    retry(u: AuthUser, w: string, p: string, id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            run: import("../entities/automation-run.entity").AutomationRun;
        };
    }>;
}
