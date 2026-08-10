"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNotificationArchive1786043000000 = void 0;
class AddNotificationArchive1786043000000 {
    name = 'AddNotificationArchive1786043000000';
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE `notifications` ADD `archived_at` datetime(6) NULL');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `notifications` DROP COLUMN `archived_at`');
    }
}
exports.AddNotificationArchive1786043000000 = AddNotificationArchive1786043000000;
//# sourceMappingURL=1786043000000-AddNotificationArchive.js.map