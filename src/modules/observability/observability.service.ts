import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { ObservabilityEvent } from './entities/observability-event.entity';

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);
  constructor(@InjectRepository(AdminAuditLog) private audits: Repository<AdminAuditLog>, @InjectRepository(ObservabilityEvent) private events: Repository<ObservabilityEvent>) {}
  audit(input: Partial<AdminAuditLog>) { return this.audits.save(this.audits.create(input)); }
  async record(input: Partial<ObservabilityEvent>) { try { const event = await this.events.save(this.events.create(input)); if (input.status === 'FAILED') this.logger.error(`[ALERT] ${input.kind}/${input.operation}: ${input.error ?? 'failed'}`); return event; } catch (error) { this.logger.error(`Cannot persist telemetry: ${error instanceof Error ? error.message : error}`); return null; } }
  async auditLogs(page = 1, limit = 50) { const [items, total] = await this.audits.findAndCount({ order: { createdAt: 'DESC' }, skip: (page - 1) * limit, take: limit }); return { items, total, page, limit }; }
  async summary(hours = 24) { const since = new Date(Date.now() - hours * 3600000); const items = await this.events.find({ where: { createdAt: MoreThanOrEqual(since) }, order: { createdAt: 'DESC' }, take: 500 }); const ai = items.filter((item) => item.kind === 'AI'); return { windowHours: hours, totals: { events: items.length, failures: items.filter((item) => item.status === 'FAILED').length, slowApis: items.filter((item) => item.kind === 'API' && item.status === 'SLOW').length, failedJobs: items.filter((item) => item.kind === 'SCHEDULER' && item.status === 'FAILED').length, failedEmails: items.filter((item) => item.kind === 'EMAIL' && item.status === 'FAILED').length }, ai: { calls: ai.length, inputTokens: ai.reduce((sum, item) => sum + (item.inputTokens ?? 0), 0), outputTokens: ai.reduce((sum, item) => sum + (item.outputTokens ?? 0), 0), estimatedCostUsd: ai.reduce((sum, item) => sum + Number(item.estimatedCostUsd ?? 0), 0), averageLatencyMs: ai.length ? Math.round(ai.reduce((sum, item) => sum + (item.durationMs ?? 0), 0) / ai.length) : 0 }, recentFailures: items.filter((item) => item.status === 'FAILED' || item.status === 'WARNING').slice(0, 20) }; }
}
