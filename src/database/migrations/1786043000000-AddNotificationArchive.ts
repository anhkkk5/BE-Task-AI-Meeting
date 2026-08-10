import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationArchive1786043000000 implements MigrationInterface {
  name = 'AddNotificationArchive1786043000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notifications` ADD `archived_at` datetime(6) NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `notifications` DROP COLUMN `archived_at`',
    );
  }
}
