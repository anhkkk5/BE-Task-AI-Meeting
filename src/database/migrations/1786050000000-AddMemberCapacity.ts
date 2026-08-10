import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddMemberCapacity1786050000000 implements MigrationInterface {
  name = 'AddMemberCapacity1786050000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_members` ADD `daily_capacity_hours` float NOT NULL DEFAULT 8');
    await queryRunner.query('ALTER TABLE `workspace_members` ADD `unavailable_dates` json NULL');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `workspace_members` DROP COLUMN `unavailable_dates`');
    await queryRunner.query('ALTER TABLE `workspace_members` DROP COLUMN `daily_capacity_hours`');
  }
}
