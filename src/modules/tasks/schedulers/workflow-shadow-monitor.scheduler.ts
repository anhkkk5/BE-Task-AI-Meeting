import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ObservabilityService } from '../../observability/observability.service';

@Injectable()
export class WorkflowShadowMonitorScheduler {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private observability: ObservabilityService,
  ) {}
  @Cron('0 */10 * * * *')
  async check() {
    const started = Date.now();
    try {
      const rows = (await this.dataSource.query(
        `SELECT COUNT(*) total, SUM(CASE WHEN task.workflow_status_id IS NULL THEN 1 ELSE 0 END) missing_workflow, SUM(CASE WHEN workflow_status.id IS NOT NULL AND task.status <> workflow_status.status_key THEN 1 ELSE 0 END) mismatched FROM tasks task LEFT JOIN workflow_statuses workflow_status ON workflow_status.id = task.workflow_status_id WHERE task.deleted_at IS NULL`,
      )) as Array<{
        total: string;
        missing_workflow: string;
        mismatched: string;
      }>;
      const result = rows[0] ?? {
        total: '0',
        missing_workflow: '0',
        mismatched: '0',
      };
      const missing = Number(result.missing_workflow);
      const mismatched = Number(result.mismatched);
      await this.observability.record({
        kind: 'SCHEDULER',
        status: missing || mismatched ? 'WARNING' : 'SUCCESS',
        operation: 'workflow.shadow.compatibility',
        durationMs: Date.now() - started,
        error:
          missing || mismatched
            ? `${missing} missing workflow IDs, ${mismatched} shadow mismatches`
            : null,
        metadata: {
          total: Number(result.total),
          missingWorkflow: missing,
          mismatched,
        },
      });
    } catch (error) {
      await this.observability.record({
        kind: 'SCHEDULER',
        status: 'FAILED',
        operation: 'workflow.shadow.compatibility',
        durationMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
        metadata: null,
      });
    }
  }
}
