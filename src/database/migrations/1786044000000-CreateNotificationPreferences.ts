import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationPreferences1786044000000 implements MigrationInterface {
  name = 'CreateNotificationPreferences1786044000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`notification_preferences\` (
      \`id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL,
      \`disabled_types\` json NOT NULL, \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      UNIQUE INDEX \`IDX_notification_preferences_user\` (\`user_id\`), PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_notification_preferences_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `notification_preferences`');
  }
}
