"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserMfa1786056000000 = void 0;
class AddUserMfa1786056000000 {
    name = 'AddUserMfa1786056000000';
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE `users` ADD `mfa_enabled` tinyint(1) NOT NULL DEFAULT 0');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `users` DROP COLUMN `mfa_enabled`');
    }
}
exports.AddUserMfa1786056000000 = AddUserMfa1786056000000;
//# sourceMappingURL=1786056000000-AddUserMfa.js.map