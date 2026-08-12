import { Repository } from 'typeorm';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { ObservabilityEvent } from './entities/observability-event.entity';
export declare class ObservabilityService {
    private audits;
    private events;
    private readonly logger;
    constructor(audits: Repository<AdminAuditLog>, events: Repository<ObservabilityEvent>);
    audit(input: Partial<AdminAuditLog>): Promise<AdminAuditLog>;
    record(input: Partial<ObservabilityEvent>): Promise<ObservabilityEvent | null>;
    auditLogs(page?: number, limit?: number): Promise<{
        items: AdminAuditLog[];
        total: number;
        page: number;
        limit: number;
    }>;
    summary(hours?: number): Promise<{
        windowHours: number;
        totals: {
            events: number;
            failures: number;
            slowApis: number;
            failedJobs: number;
            failedEmails: number;
        };
        ai: {
            calls: number;
            inputTokens: number;
            outputTokens: number;
            estimatedCostUsd: number;
            averageLatencyMs: number;
        };
        recentFailures: ObservabilityEvent[];
    }>;
}
