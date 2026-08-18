"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeWorkflowStatusCanonical1786054000000 = void 0;
class MakeWorkflowStatusCanonical1786054000000 {
    name = 'MakeWorkflowStatusCanonical1786054000000';
    async up(queryRunner) {
        await queryRunner.query(`
      UPDATE tasks task
      JOIN projects project ON project.id = task.project_id
      JOIN workflow_statuses workflow_status
        ON workflow_status.template_id = project.workflow_template_id
       AND workflow_status.status_key = task.status
      SET task.workflow_status_id = workflow_status.id
      WHERE task.workflow_status_id IS NULL
    `);
        await queryRunner.query('ALTER TABLE `tasks` DROP FOREIGN KEY `FK_task_workflow_status`');
        await queryRunner.query('ALTER TABLE `tasks` MODIFY `workflow_status_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL');
        await queryRunner.query('ALTER TABLE `tasks` ADD CONSTRAINT `FK_task_workflow_status` FOREIGN KEY (`workflow_status_id`) REFERENCES `workflow_statuses`(`id`) ON DELETE RESTRICT');
        await queryRunner.query('CREATE INDEX `IDX_tasks_workflow_status_id` ON `tasks` (`workflow_status_id`)');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX `IDX_tasks_workflow_status_id` ON `tasks`');
        await queryRunner.query('ALTER TABLE `tasks` DROP FOREIGN KEY `FK_task_workflow_status`');
        await queryRunner.query('ALTER TABLE `tasks` MODIFY `workflow_status_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL');
        await queryRunner.query('ALTER TABLE `tasks` ADD CONSTRAINT `FK_task_workflow_status` FOREIGN KEY (`workflow_status_id`) REFERENCES `workflow_statuses`(`id`) ON DELETE SET NULL');
    }
}
exports.MakeWorkflowStatusCanonical1786054000000 = MakeWorkflowStatusCanonical1786054000000;
//# sourceMappingURL=1786054000000-MakeWorkflowStatusCanonical.js.map