import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Them noi dung thu 4 cua bao cao ca nhan trong luong giao ban: "Can ai ho tro?".
 *
 * Dung khoa ngoai tro ve NULL thay vi CASCADE: khi nguoi duoc nho ho tro bi xoa
 * khoi he thong thi bao cao cu van con gia tri lich su, chi mat thong tin nguoi
 * ho tro.
 */
export class AddDailyUpdateNeedHelpFrom1719620000000 implements MigrationInterface {
  name = 'AddDailyUpdateNeedHelpFrom1719620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`daily_updates\`
      ADD COLUMN \`need_help_from_id\` varchar(36) NULL AFTER \`blockers\`
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_daily_updates_need_help_from_id\`
      ON \`daily_updates\` (\`need_help_from_id\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`daily_updates\`
      ADD CONSTRAINT \`FK_daily_updates_need_help_from_id\`
      FOREIGN KEY (\`need_help_from_id\`) REFERENCES \`users\` (\`id\`)
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`daily_updates\`
      DROP FOREIGN KEY \`FK_daily_updates_need_help_from_id\`
    `);
    await queryRunner.query(`
      DROP INDEX \`IDX_daily_updates_need_help_from_id\` ON \`daily_updates\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`daily_updates\` DROP COLUMN \`need_help_from_id\`
    `);
  }
}
