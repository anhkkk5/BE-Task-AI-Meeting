"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTaskStartedAt1786049000000 = void 0;
class AddTaskStartedAt1786049000000 {
    name = 'AddTaskStartedAt1786049000000';
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE `tasks` ADD `started_at` datetime NULL');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `tasks` DROP COLUMN `started_at`');
    }
}
exports.AddTaskStartedAt1786049000000 = AddTaskStartedAt1786049000000;
//# sourceMappingURL=1786049000000-AddTaskStartedAt.js.map