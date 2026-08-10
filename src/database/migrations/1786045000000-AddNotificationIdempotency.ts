import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationIdempotency1786045000000 implements MigrationInterface {
  name = 'AddNotificationIdempotency1786045000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `notifications` ADD `idempotency_key` varchar(200) NULL');
    await queryRunner.query('CREATE UNIQUE INDEX `IDX_notifications_idempotency_key` ON `notifications` (`idempotency_key`)');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `IDX_notifications_idempotency_key` ON `notifications`');
    await queryRunner.query('ALTER TABLE `notifications` DROP COLUMN `idempotency_key`');
  }
}
