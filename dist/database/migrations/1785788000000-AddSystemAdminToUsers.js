"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSystemAdminToUsers1785788000000 = void 0;
class AddSystemAdminToUsers1785788000000 {
    name = 'AddSystemAdminToUsers1785788000000';
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE `users` ADD `is_system_admin` tinyint(1) NOT NULL DEFAULT 0');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `users` DROP COLUMN `is_system_admin`');
    }
}
exports.AddSystemAdminToUsers1785788000000 = AddSystemAdminToUsers1785788000000;
//# sourceMappingURL=1785788000000-AddSystemAdminToUsers.js.map