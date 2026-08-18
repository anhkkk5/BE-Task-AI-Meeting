"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskComments1786041000000 = void 0;
class CreateTaskComments1786041000000 {
    name = 'CreateTaskComments1786041000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE \`task_comments\` (
        \`id\` varchar(36) NOT NULL,
        \`task_id\` varchar(36) NOT NULL,
        \`author_id\` varchar(36) NOT NULL,
        \`content\` text NOT NULL,
        \`mentioned_user_ids\` json NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL,
        INDEX \`IDX_task_comment_task_created\` (\`task_id\`, \`created_at\`),
        INDEX \`IDX_task_comment_author\` (\`author_id\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_task_comment_task\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_task_comment_author\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE `task_comments`');
    }
}
exports.CreateTaskComments1786041000000 = CreateTaskComments1786041000000;
//# sourceMappingURL=1786041000000-CreateTaskComments.js.map