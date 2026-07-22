"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAiUserPreferences1719300000000 = void 0;
class CreateAiUserPreferences1719300000000 {
    name = 'CreateAiUserPreferences1719300000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE \`ai_user_preferences\` (
        \`user_id\` varchar(36) NOT NULL,
        \`response_style\` enum('CONCISE','BALANCED','DETAILED') NOT NULL DEFAULT 'BALANCED',
        \`tone\` enum('PROFESSIONAL','DIRECT','SUPPORTIVE') NOT NULL DEFAULT 'PROFESSIONAL',
        \`focus_areas\` text NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`user_id\`),
        CONSTRAINT \`FK_ai_user_preferences_user\`
          FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE `ai_user_preferences`');
    }
}
exports.CreateAiUserPreferences1719300000000 = CreateAiUserPreferences1719300000000;
//# sourceMappingURL=1719300000000-CreateAiUserPreferences.js.map