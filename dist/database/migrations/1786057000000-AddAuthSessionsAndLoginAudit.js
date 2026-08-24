"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAuthSessionsAndLoginAudit1786057000000 = void 0;
class AddAuthSessionsAndLoginAudit1786057000000 {
    name = 'AddAuthSessionsAndLoginAudit1786057000000';
    async up(q) {
        await q.query('CREATE TABLE `auth_sessions` (`id` char(36) NOT NULL, `user_id` char(36) NOT NULL, `refresh_token_hash` varchar(255) NOT NULL, `user_agent` varchar(500) NULL, `ip_address` varchar(64) NULL, `last_used_at` datetime(6) NOT NULL, `expires_at` datetime(6) NOT NULL, `revoked_at` datetime(6) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX `IDX_auth_sessions_user` (`user_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB');
        await q.query('CREATE TABLE `auth_login_attempts` (`id` char(36) NOT NULL, `user_id` char(36) NULL, `email` varchar(255) NOT NULL, `success` tinyint(1) NOT NULL, `reason` varchar(60) NOT NULL, `ip_address` varchar(64) NULL, `user_agent` varchar(500) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_auth_attempt_user` (`user_id`), INDEX `IDX_auth_attempt_email` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB');
    }
    async down(q) {
        await q.query('DROP TABLE `auth_login_attempts`');
        await q.query('DROP TABLE `auth_sessions`');
    }
}
exports.AddAuthSessionsAndLoginAudit1786057000000 = AddAuthSessionsAndLoginAudit1786057000000;
//# sourceMappingURL=1786057000000-AddAuthSessionsAndLoginAudit.js.map