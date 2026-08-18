import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskMetadata1786048000000 implements MigrationInterface {
  name = 'AddTaskMetadata1786048000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tasks` ADD `labels` json NULL');
    await queryRunner.query('ALTER TABLE `tasks` ADD `acceptance_criteria` text NULL');
    await queryRunner.query('ALTER TABLE `tasks` ADD `reporter_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL');
    await queryRunner.query('ALTER TABLE `tasks` ADD `completed_at` datetime NULL');
    await queryRunner.query('CREATE INDEX `IDX_tasks_reporter_id` ON `tasks` (`reporter_id`)');
    await queryRunner.query('ALTER TABLE `tasks` ADD CONSTRAINT `FK_tasks_reporter_id` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE SET NULL');
    await queryRunner.query('UPDATE `tasks` SET `reporter_id` = `created_by` WHERE `reporter_id` IS NULL');
    await queryRunner.query("UPDATE `tasks` SET `completed_at` = `updated_at` WHERE `status` = 'DONE' AND `completed_at` IS NULL");
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tasks` DROP FOREIGN KEY `FK_tasks_reporter_id`');
    await queryRunner.query('DROP INDEX `IDX_tasks_reporter_id` ON `tasks`');
    await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `completed_at`');
    await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `reporter_id`');
    await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `acceptance_criteria`');
    await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `labels`');
  }
}
