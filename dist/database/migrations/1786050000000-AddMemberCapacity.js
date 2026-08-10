"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMemberCapacity1786050000000 = void 0;
class AddMemberCapacity1786050000000 {
    name = 'AddMemberCapacity1786050000000';
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE `workspace_members` ADD `daily_capacity_hours` float NOT NULL DEFAULT 8');
        await queryRunner.query('ALTER TABLE `workspace_members` ADD `unavailable_dates` json NULL');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `workspace_members` DROP COLUMN `unavailable_dates`');
        await queryRunner.query('ALTER TABLE `workspace_members` DROP COLUMN `daily_capacity_hours`');
    }
}
exports.AddMemberCapacity1786050000000 = AddMemberCapacity1786050000000;
//# sourceMappingURL=1786050000000-AddMemberCapacity.js.map