import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertShiftHandoversToTaskHandovers1719220000000 implements MigrationInterface {
  name = 'ConvertShiftHandoversToTaskHandovers1719220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` DROP FOREIGN KEY `FK_handovers_source_shift`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` DROP FOREIGN KEY `FK_handovers_target_shift`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` DROP INDEX `IDX_handovers_source_shift`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` DROP COLUMN `source_shift_id`, DROP COLUMN `target_shift_id`',
    );
    // TiDB does not resolve a column added earlier in the same multi-action
    // ALTER when a later action uses it in an AFTER clause. Keep these as
    // separate statements; this remains valid on MySQL and TiDB.
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `task_id` varchar(36) NULL AFTER `project_id`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `completed_work` text NULL AFTER `summary`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `remaining_work` text NULL AFTER `completed_work`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `blockers` text NULL AFTER `remaining_work`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `next_steps` text NULL AFTER `blockers`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `reference_links` text NULL AFTER `next_steps`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `due_at` datetime NULL AFTER `reference_links`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `rejection_reason` varchar(1000) NULL AFTER `change_request`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD COLUMN `rejected_at` datetime NULL AFTER `acknowledged_at`',
    );
    await queryRunner.query(
      "ALTER TABLE `shift_handovers` MODIFY COLUMN `status` enum('DRAFT','PENDING','CHANGES_REQUESTED','ACKNOWLEDGED','REJECTED','CANCELLED') NOT NULL DEFAULT 'DRAFT'",
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_handovers_task` ON `shift_handovers` (`task_id`)',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD CONSTRAINT `FK_handovers_task` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `shift_handovers` SET `status` = 'CANCELLED' WHERE `status` = 'REJECTED'",
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` DROP FOREIGN KEY `FK_handovers_task`',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` DROP INDEX `IDX_handovers_task`',
    );
    await queryRunner.query(`
      ALTER TABLE \`shift_handovers\`
        DROP COLUMN \`task_id\`,
        DROP COLUMN \`completed_work\`,
        DROP COLUMN \`remaining_work\`,
        DROP COLUMN \`blockers\`,
        DROP COLUMN \`next_steps\`,
        DROP COLUMN \`reference_links\`,
        DROP COLUMN \`due_at\`,
        DROP COLUMN \`rejection_reason\`,
        DROP COLUMN \`rejected_at\`,
        ADD COLUMN \`source_shift_id\` varchar(36) NULL AFTER \`project_id\`,
        ADD COLUMN \`target_shift_id\` varchar(36) NULL AFTER \`source_shift_id\`
    `);
    await queryRunner.query(
      "ALTER TABLE `shift_handovers` MODIFY COLUMN `status` enum('DRAFT','PENDING','CHANGES_REQUESTED','ACKNOWLEDGED','CANCELLED') NOT NULL DEFAULT 'DRAFT'",
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_handovers_source_shift` ON `shift_handovers` (`source_shift_id`)',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD CONSTRAINT `FK_handovers_source_shift` FOREIGN KEY (`source_shift_id`) REFERENCES `shifts`(`id`) ON DELETE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `shift_handovers` ADD CONSTRAINT `FK_handovers_target_shift` FOREIGN KEY (`target_shift_id`) REFERENCES `shifts`(`id`) ON DELETE SET NULL',
    );
  }
}
