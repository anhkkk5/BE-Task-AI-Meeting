import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddAutomationEngine1786058000000 implements MigrationInterface {
  name = 'AddAutomationEngine1786058000000';
  async up(q: QueryRunner) {
    await q.query(
      'CREATE TABLE `automation_rules` (`id` char(36) NOT NULL, `workspace_id` char(36) NOT NULL, `project_id` char(36) NOT NULL, `name` varchar(160) NOT NULL, `enabled` tinyint(1) NOT NULL DEFAULT 0, `trigger` json NOT NULL, `conditions` json NOT NULL, `actions` json NOT NULL, `dry_run_at` datetime NULL, `created_by` char(36) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX `IDX_automation_workspace` (`workspace_id`), INDEX `IDX_automation_project` (`project_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await q.query(
      'CREATE TABLE `automation_runs` (`id` char(36) NOT NULL, `rule_id` char(36) NOT NULL, `task_id` char(36) NULL, `execution_key` varchar(220) NOT NULL, `status` varchar(20) NOT NULL, `result` json NULL, `error` text NULL, `retry_count` int NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_automation_run_rule` (`rule_id`), UNIQUE INDEX `IDX_automation_execution` (`execution_key`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }
  async down(q: QueryRunner) {
    await q.query('DROP TABLE `automation_runs`');
    await q.query('DROP TABLE `automation_rules`');
  }
}
