"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskActivityLogs1786040000000 = void 0;
class CreateTaskActivityLogs1786040000000 {
    name = 'CreateTaskActivityLogs1786040000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE \`task_activity_logs\` (
        \`id\` varchar(36) NOT NULL,
        \`task_id\` varchar(36) NOT NULL,
        \`project_id\` varchar(36) NOT NULL,
        \`actor_id\` varchar(36) NOT NULL,
        \`action\` varchar(40) NOT NULL,
        \`changes\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_task_activity_task_created\` (\`task_id\`, \`created_at\`),
        INDEX \`IDX_task_activity_project\` (\`project_id\`),
        INDEX \`IDX_task_activity_actor\` (\`actor_id\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_task_activity_task\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_task_activity_actor\` FOREIGN KEY (\`actor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE `task_activity_logs`');
    }
}
exports.CreateTaskActivityLogs1786040000000 = CreateTaskActivityLogs1786040000000;
//# sourceMappingURL=1786040000000-CreateTaskActivityLogs.js.map