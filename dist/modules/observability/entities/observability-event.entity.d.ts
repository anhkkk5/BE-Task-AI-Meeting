export type ObservabilityKind = 'API' | 'SCHEDULER' | 'EMAIL' | 'MONGODB' | 'AI';
export declare class ObservabilityEvent {
    id: string;
    kind: ObservabilityKind;
    status: 'SUCCESS' | 'FAILED' | 'SLOW' | 'WARNING';
    operation: string;
    durationMs: number | null;
    inputTokens: number | null;
    outputTokens: number | null;
    estimatedCostUsd: number | null;
    error: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}
