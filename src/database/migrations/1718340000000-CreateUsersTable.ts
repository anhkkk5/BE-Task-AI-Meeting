import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1718340000000 implements MigrationInterface {
  name = 'CreateUsersTable1718340000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id varchar(36) NOT NULL,
        email varchar(255) NOT NULL,
        full_name varchar(120) NOT NULL,
        password_hash varchar(255) NOT NULL,
        status enum('active', 'inactive') NOT NULL DEFAULT 'active',
        refresh_token_hash varchar(255) NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX IDX_users_email (email),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE users');
  }
}
