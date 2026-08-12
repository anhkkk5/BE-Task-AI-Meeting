"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTaskPriority1786055000000 = void 0;
class AddTaskPriority1786055000000 {
    name = 'AddTaskPriority1786055000000';
    async up(queryRunner) {
        await queryRunner.query("ALTER TABLE `tasks` ADD `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM' AFTER `task_type`");
        await queryRunner.query('CREATE INDEX `IDX_tasks_priority` ON `tasks` (`priority`)');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX `IDX_tasks_priority` ON `tasks`');
        await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `priority`');
    }
}
exports.AddTaskPriority1786055000000 = AddTaskPriority1786055000000;
//# sourceMappingURL=1786055000000-AddTaskPriority.js.map