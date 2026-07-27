import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamReportActionItems1719700000000
  implements MigrationInterface
{
  name = 'CreateTeamReportActionItems1719700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`team_report_action_items\` (
        \`id\` varchar(36) NOT NULL,
        \`workspace_id\` varchar(36) NOT NULL,
        \`project_id\` varchar(36) NOT NULL,
        \`report_id\` varchar(64) NOT NULL,
        \`source\` enum('BLOCKER','RECOMMENDATION') NOT NULL,
        \`item_index\` int NOT NULL,
        \`item_text\` text NOT NULL,
        \`status\` enum('PENDING','TASK_CREATED','HANDOVER_REQUESTED','DISMISSED') NOT NULL DEFAULT 'PENDING',
        \`created_task_id\` varchar(36) NULL,
        \`target_task_id\` varchar(36) NULL,
        \`suggested_receiver_id\` varchar(36) NULL,
        \`handover_id\` varchar(36) NULL,
        \`note\` varchar(500) NULL,
        \`handled_by\` varchar(36) NULL,
        \`handled_at\` datetime NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_team_report_item_workspace\` (\`workspace_id\`),
        INDEX \`IDX_team_report_item_project\` (\`project_id\`),
        INDEX \`IDX_team_report_item_report\` (\`report_id\`),
        UNIQUE INDEX \`IDX_team_report_item_unique\` (\`report_id\`, \`source\`, \`item_index\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_team_report_item_task\` FOREIGN KEY (\`created_task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_team_report_item_target_task\` FOREIGN KEY (\`target_task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_team_report_item_receiver\` FOREIGN KEY (\`suggested_receiver_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_team_report_item_handover\` FOREIGN KEY (\`handover_id\`) REFERENCES \`shift_handovers\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_team_report_item_handler\` FOREIGN KEY (\`handled_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `team_report_action_items`');
  }
}
