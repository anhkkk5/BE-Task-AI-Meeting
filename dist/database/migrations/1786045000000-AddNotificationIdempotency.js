"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNotificationIdempotency1786045000000 = void 0;
class AddNotificationIdempotency1786045000000 {
    name = 'AddNotificationIdempotency1786045000000';
    async up(queryRunner) {
        await queryRunner.query('ALTER TABLE `notifications` ADD `idempotency_key` varchar(200) NULL');
        await queryRunner.query('CREATE UNIQUE INDEX `IDX_notifications_idempotency_key` ON `notifications` (`idempotency_key`)');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP INDEX `IDX_notifications_idempotency_key` ON `notifications`');
        await queryRunner.query('ALTER TABLE `notifications` DROP COLUMN `idempotency_key`');
    }
}
exports.AddNotificationIdempotency1786045000000 = AddNotificationIdempotency1786045000000;
//# sourceMappingURL=1786045000000-AddNotificationIdempotency.js.map