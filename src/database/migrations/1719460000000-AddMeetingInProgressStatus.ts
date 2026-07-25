import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMeetingInProgressStatus1719460000000
  implements MigrationInterface
{
  name = 'AddMeetingInProgressStatus1719460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`meetings\`
      MODIFY COLUMN \`status\` enum('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','ARCHIVED')
      NOT NULL DEFAULT 'SCHEDULED'
    `);
    await queryRunner.query(
      'ALTER TABLE `meetings` ADD `actual_start_time` datetime NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `meetings` ADD `actual_end_time` datetime NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `meetings` ADD `auto_completed` tinyint(1) NOT NULL DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `meetings` DROP COLUMN `auto_completed`',
    );
    await queryRunner.query(
      'ALTER TABLE `meetings` DROP COLUMN `actual_end_time`',
    );
    await queryRunner.query(
      'ALTER TABLE `meetings` DROP COLUMN `actual_start_time`',
    );
    // Gop cac cuoc hop dang dien ra ve COMPLETED truoc khi thu hep enum
    // de khong lam mat du lieu khi rollback.
    await queryRunner.query(
      "UPDATE `meetings` SET `status` = 'COMPLETED' WHERE `status` = 'IN_PROGRESS'",
    );
    await queryRunner.query(`
      ALTER TABLE \`meetings\`
      MODIFY COLUMN \`status\` enum('SCHEDULED','COMPLETED','CANCELLED','ARCHIVED')
      NOT NULL DEFAULT 'SCHEDULED'
    `);
  }
}
