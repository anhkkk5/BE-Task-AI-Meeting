import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDailyUpdateReviewWorkflow1787620000000
  implements MigrationInterface
{
  name = 'AddDailyUpdateReviewWorkflow1787620000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `daily_updates` ADD `submission_status` enum('PENDING_REVIEW','SUBMITTED','MISSED') NOT NULL DEFAULT 'SUBMITTED'",
    );
    await queryRunner.query(
      'ALTER TABLE `daily_updates` ADD `generated_by_ai` tinyint NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'ALTER TABLE `daily_updates` ADD `submitted_at` datetime NULL',
    );
    await queryRunner.query(
      "UPDATE `daily_updates` SET `submitted_at`=`created_at` WHERE `submission_status`='SUBMITTED'",
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_daily_updates_submission_status` ON `daily_updates` (`submission_status`)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_daily_updates_submission_status` ON `daily_updates`',
    );
    await queryRunner.query('ALTER TABLE `daily_updates` DROP COLUMN `submitted_at`');
    await queryRunner.query('ALTER TABLE `daily_updates` DROP COLUMN `generated_by_ai`');
    await queryRunner.query('ALTER TABLE `daily_updates` DROP COLUMN `submission_status`');
  }
}
