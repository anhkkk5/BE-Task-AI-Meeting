export declare class AutomationRule {
    id: string;
    workspaceId: string;
    projectId: string;
    name: string;
    enabled: boolean;
    trigger: {
        type: 'DUE_DATE';
        daysBefore?: number;
    };
    conditions: Array<{
        field: string;
        operator: string;
        value?: unknown;
    }>;
    actions: Array<{
        type: 'NOTIFY_ASSIGNEE' | 'CHANGE_STATUS' | 'ASSIGN_USER';
        value?: string;
        message?: string;
    }>;
    dryRunAt: Date | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
