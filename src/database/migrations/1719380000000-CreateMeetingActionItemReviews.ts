import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMeetingActionItemReviews1719380000000 implements MigrationInterface {
  name = 'CreateMeetingActionItemReviews1719380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`meeting_action_item_reviews\` (
        \`id\` varchar(36) NOT NULL,
        \`workspace_id\` varchar(36) NOT NULL,
        \`project_id\` varchar(36) NOT NULL,
        \`meeting_id\` varchar(36) NOT NULL,
        \`summary_id\` varchar(36) NOT NULL,
        \`action_item_index\` int NOT NULL,
        \`action_item_text\` text NOT NULL,
        \`suggested_assignee_name\` varchar(200) NULL,
        \`suggested_due_date\` date NULL,
        \`status\` enum('PENDING','TASK_CREATED','REJECTED') NOT NULL DEFAULT 'PENDING',
        \`reviewed_by\` varchar(36) NULL,
        \`reviewed_at\` datetime NULL,
        \`created_task_id\` varchar(36) NULL,
        \`rejection_reason\` varchar(500) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_action_item_review_workspace\` (\`workspace_id\`),
        INDEX \`IDX_action_item_review_project\` (\`project_id\`),
        INDEX \`IDX_action_item_review_meeting\` (\`meeting_id\`),
        UNIQUE INDEX \`IDX_action_item_review_summary_index\` (\`summary_id\`, \`action_item_index\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_action_item_review_task\` FOREIGN KEY (\`created_task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE SET NULL,
        CONSTRAINT \`FK_action_item_review_reviewer\` FOREIGN KEY (\`reviewed_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `meeting_action_item_reviews`');
  }
}
