import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePriorityFields1719060000000 implements MigrationInterface {
  name = 'RemovePriorityFields1719060000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IDX_tasks_priority ON tasks');
    await queryRunner.query('ALTER TABLE tasks DROP COLUMN priority');
    await queryRunner.query('ALTER TABLE handover_items DROP COLUMN priority');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE handover_items ADD priority enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM'",
    );
    await queryRunner.query(
      "ALTER TABLE tasks ADD priority enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM' AFTER status",
    );
    await queryRunner.query(
      'CREATE INDEX IDX_tasks_priority ON tasks (priority)',
    );
  }
}
