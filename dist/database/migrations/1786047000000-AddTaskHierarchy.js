"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTaskHierarchy1786047000000 = void 0;
class AddTaskHierarchy1786047000000 {
    name = 'AddTaskHierarchy1786047000000';
    async up(queryRunner) {
        await queryRunner.query("ALTER TABLE `tasks` ADD `task_type` enum('EPIC','STORY','TASK','BUG','SUBTASK') NOT NULL DEFAULT 'TASK'");
        await queryRunner.query('ALTER TABLE `tasks` ADD `parent_id` varchar(36) NULL');
        await queryRunner.query('CREATE INDEX `IDX_tasks_task_type` ON `tasks` (`task_type`)');
        await queryRunner.query('CREATE INDEX `IDX_tasks_parent_id` ON `tasks` (`parent_id`)');
        await queryRunner.query('ALTER TABLE `tasks` ADD CONSTRAINT `FK_tasks_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `tasks` DROP FOREIGN KEY `FK_tasks_parent_id`');
        await queryRunner.query('DROP INDEX `IDX_tasks_parent_id` ON `tasks`');
        await queryRunner.query('DROP INDEX `IDX_tasks_task_type` ON `tasks`');
        await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `parent_id`');
        await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `task_type`');
    }
}
exports.AddTaskHierarchy1786047000000 = AddTaskHierarchy1786047000000;
//# sourceMappingURL=1786047000000-AddTaskHierarchy.js.map