import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1718420000000 implements MigrationInterface {
  name = 'AddUserProfileFields1718420000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        ADD avatar_url varchar(500) NULL,
        ADD phone_number varchar(30) NULL,
        ADD job_title varchar(120) NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN job_title,
        DROP COLUMN phone_number,
        DROP COLUMN avatar_url
    `);
  }
}
