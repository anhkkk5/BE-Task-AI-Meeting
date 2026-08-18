"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskDependencies1786046000000 = void 0;
class CreateTaskDependencies1786046000000 {
    name = 'CreateTaskDependencies1786046000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`task_dependencies\` (
      \`id\` varchar(36) NOT NULL, \`source_task_id\` varchar(36) NOT NULL, \`target_task_id\` varchar(36) NOT NULL,
      \`type\` enum('BLOCKS','DEPENDS_ON','RELATES_TO','DUPLICATES') NOT NULL, \`created_by\` varchar(36) NOT NULL,
      \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      UNIQUE INDEX \`IDX_task_dependency_unique\` (\`source_task_id\`, \`target_task_id\`, \`type\`), PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_task_dependency_source\` FOREIGN KEY (\`source_task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`FK_task_dependency_target\` FOREIGN KEY (\`target_task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`FK_task_dependency_creator\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin`);
    }
    async down(queryRunner) { await queryRunner.query('DROP TABLE `task_dependencies`'); }
}
exports.CreateTaskDependencies1786046000000 = CreateTaskDependencies1786046000000;
//# sourceMappingURL=1786046000000-CreateTaskDependencies.js.map