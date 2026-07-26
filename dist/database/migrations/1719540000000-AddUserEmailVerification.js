"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserEmailVerification1719540000000 = void 0;
class AddUserEmailVerification1719540000000 {
    name = 'AddUserEmailVerification1719540000000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`email_verified_at\` datetime(6) NULL AFTER \`status\`
    `);
        await queryRunner.query(`
      UPDATE \`users\`
      SET \`email_verified_at\` = CURRENT_TIMESTAMP(6)
      WHERE \`email_verified_at\` IS NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `users` DROP COLUMN `email_verified_at`');
    }
}
exports.AddUserEmailVerification1719540000000 = AddUserEmailVerification1719540000000;
//# sourceMappingURL=1719540000000-AddUserEmailVerification.js.map