"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemovePriorityFields1719060000000 = void 0;
class RemovePriorityFields1719060000000 {
    name = 'RemovePriorityFields1719060000000';
    async up(queryRunner) {
        await queryRunner.query('DROP INDEX IDX_tasks_priority ON tasks');
        await queryRunner.query('ALTER TABLE tasks DROP COLUMN priority');
        await queryRunner.query('ALTER TABLE handover_items DROP COLUMN priority');
    }
    async down(queryRunner) {
        await queryRunner.query("ALTER TABLE handover_items ADD priority enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM'");
        await queryRunner.query("ALTER TABLE tasks ADD priority enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM' AFTER status");
        await queryRunner.query('CREATE INDEX IDX_tasks_priority ON tasks (priority)');
    }
}
exports.RemovePriorityFields1719060000000 = RemovePriorityFields1719060000000;
//# sourceMappingURL=1719060000000-RemovePriorityFields.js.map