"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotifications1786042000000 = void 0;
class CreateNotifications1786042000000 {
    name = 'CreateNotifications1786042000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`notifications\` (
      \`id\` varchar(36) NOT NULL, \`recipient_id\` varchar(36) NOT NULL,
      \`type\` varchar(50) NOT NULL, \`title\` varchar(200) NOT NULL,
      \`body\` varchar(1000) NOT NULL, \`link\` varchar(500) NOT NULL,
      \`metadata\` json NULL, \`read_at\` datetime(6) NULL,
      \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      INDEX \`IDX_notification_recipient_read_created\` (\`recipient_id\`, \`read_at\`, \`created_at\`),
      PRIMARY KEY (\`id\`), CONSTRAINT \`FK_notification_recipient\` FOREIGN KEY (\`recipient_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    }
    async down(queryRunner) { await queryRunner.query('DROP TABLE `notifications`'); }
}
exports.CreateNotifications1786042000000 = CreateNotifications1786042000000;
//# sourceMappingURL=1786042000000-CreateNotifications.js.map