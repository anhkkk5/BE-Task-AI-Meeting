import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserEmailVerification1719540000000 implements MigrationInterface {
  name = 'AddUserEmailVerification1719540000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`email_verified_at\` datetime(6) NULL AFTER \`status\`
    `);

    // Cac tai khoan tao truoc khi co tinh nang nay chua tung xac thuc email.
    // Danh dau tat ca la da xac thuc de khong khoa nguoi dang dung he thong;
    // quy dinh moi chi ap dung cho nguoi dang ky tu day tro di.
    await queryRunner.query(`
      UPDATE \`users\`
      SET \`email_verified_at\` = CURRENT_TIMESTAMP(6)
      WHERE \`email_verified_at\` IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `email_verified_at`',
    );
  }
}
