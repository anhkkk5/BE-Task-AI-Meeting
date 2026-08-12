import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AutomationRepository } from '../repositories/automation.repository';
import { AutomationService } from '../services/automation.service';
import { ObservabilityService } from '../../observability/observability.service';
@Injectable()
export class AutomationScheduler {
  constructor(private repo: AutomationRepository, private service: AutomationService, private observability: ObservabilityService) {}
  @Cron('0 */5 * * * *') async run() { const started = Date.now(); try { const rules = await this.repo.enabledRules(); for (const rule of rules) await this.service.runRule(rule); await this.observability.record({ kind: 'SCHEDULER', status: 'SUCCESS', operation: 'automation.run', durationMs: Date.now() - started, error: null, metadata: { rules: rules.length } }); } catch (error) { await this.observability.record({ kind: 'SCHEDULER', status: 'FAILED', operation: 'automation.run', durationMs: Date.now() - started, error: error instanceof Error ? error.message : String(error), metadata: null }); } }
}
