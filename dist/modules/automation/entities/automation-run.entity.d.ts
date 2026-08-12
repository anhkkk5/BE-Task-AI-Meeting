export declare class AutomationRun {
    id: string;
    ruleId: string;
    taskId: string | null;
    executionKey: string;
    status: 'SUCCESS' | 'FAILED' | 'DRY_RUN' | 'SKIPPED';
    result: Record<string, unknown> | null;
    error: string | null;
    retryCount: number;
    createdAt: Date;
}
