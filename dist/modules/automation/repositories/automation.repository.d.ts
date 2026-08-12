import { Repository } from 'typeorm';
import { AutomationRule } from '../entities/automation-rule.entity';
import { AutomationRun } from '../entities/automation-run.entity';
export declare class AutomationRepository {
    private rules;
    private runs;
    constructor(rules: Repository<AutomationRule>, runs: Repository<AutomationRun>);
    listRules(projectId: string): Promise<AutomationRule[]>;
    enabledRules(): Promise<AutomationRule[]>;
    findRule(id: string, projectId: string): Promise<AutomationRule | null>;
    saveRule(data: Partial<AutomationRule>): Promise<AutomationRule>;
    deleteRule(rule: AutomationRule): Promise<AutomationRule>;
    listRuns(ruleId: string): Promise<AutomationRun[]>;
    findRun(id: string): Promise<AutomationRun | null>;
    findExecution(key: string): Promise<AutomationRun | null>;
    saveRun(data: Partial<AutomationRun>): Promise<AutomationRun>;
}
