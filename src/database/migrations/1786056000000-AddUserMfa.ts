import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddUserMfa1786056000000 implements MigrationInterface {
  name = 'AddUserMfa1786056000000';
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `mfa_enabled` tinyint(1) NOT NULL DEFAULT 0',
    );
  }
  async down(queryRunner: QueryRunner) {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `mfa_enabled`');
  }
}
