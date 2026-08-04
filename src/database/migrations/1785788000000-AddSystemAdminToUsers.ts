import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSystemAdminToUsers1785788000000 implements MigrationInterface {
  name = 'AddSystemAdminToUsers1785788000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `is_system_admin` tinyint(1) NOT NULL DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `is_system_admin`',
    );
  }
}
