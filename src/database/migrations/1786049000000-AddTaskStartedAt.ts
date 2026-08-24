import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddTaskStartedAt1786049000000 implements MigrationInterface {
  name = 'AddTaskStartedAt1786049000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tasks` ADD `started_at` datetime NULL',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `started_at`');
  }
}
