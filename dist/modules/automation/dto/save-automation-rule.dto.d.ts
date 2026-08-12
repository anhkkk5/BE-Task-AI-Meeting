export declare class SaveAutomationRuleDto {
    name: string;
    enabled?: boolean;
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
}
