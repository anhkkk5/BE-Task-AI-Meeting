import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskPriority1786055000000 implements MigrationInterface {
  name = 'AddTaskPriority1786055000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `tasks` ADD `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM' AFTER `task_type`",
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_tasks_priority` ON `tasks` (`priority`)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `IDX_tasks_priority` ON `tasks`');
    await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `priority`');
  }
}
