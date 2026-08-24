import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddProjectWorkflow1786051000000 implements MigrationInterface {
  name = 'AddProjectWorkflow1786051000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `workflow_statuses` json NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `projects` ADD `workflow_transitions` json NULL',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `projects` DROP COLUMN `workflow_transitions`',
    );
    await queryRunner.query(
      'ALTER TABLE `projects` DROP COLUMN `workflow_statuses`',
    );
  }
}
