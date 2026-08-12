import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddAuthSessionsAndLoginAudit1786057000000 implements MigrationInterface {
  name = 'AddAuthSessionsAndLoginAudit1786057000000';
  async up(q: QueryRunner) {
    await q.query('CREATE TABLE `auth_sessions` (`id` char(36) NOT NULL, `user_id` char(36) NOT NULL, `refresh_token_hash` varchar(255) NOT NULL, `user_agent` varchar(500) NULL, `ip_address` varchar(64) NULL, `last_used_at` datetime(6) NOT NULL, `expires_at` datetime(6) NOT NULL, `revoked_at` datetime(6) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX `IDX_auth_sessions_user` (`user_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB');
    await q.query('CREATE TABLE `auth_login_attempts` (`id` char(36) NOT NULL, `user_id` char(36) NULL, `email` varchar(255) NOT NULL, `success` tinyint(1) NOT NULL, `reason` varchar(60) NOT NULL, `ip_address` varchar(64) NULL, `user_agent` varchar(500) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_auth_attempt_user` (`user_id`), INDEX `IDX_auth_attempt_email` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB');
  }
  async down(q: QueryRunner) { await q.query('DROP TABLE `auth_login_attempts`'); await q.query('DROP TABLE `auth_sessions`'); }
}
