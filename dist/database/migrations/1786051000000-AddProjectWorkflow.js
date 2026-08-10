"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProjectWorkflow1786051000000 = void 0;
class AddProjectWorkflow1786051000000 {
    name = 'AddProjectWorkflow1786051000000';
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE `projects` ADD `workflow_statuses` json NULL');
        await queryRunner.query('ALTER TABLE `projects` ADD `workflow_transitions` json NULL');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `workflow_transitions`');
        await queryRunner.query('ALTER TABLE `projects` DROP COLUMN `workflow_statuses`');
    }
}
exports.AddProjectWorkflow1786051000000 = AddProjectWorkflow1786051000000;
//# sourceMappingURL=1786051000000-AddProjectWorkflow.js.map