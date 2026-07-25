"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMeetingInProgressStatus1719460000000 = void 0;
class AddMeetingInProgressStatus1719460000000 {
    name = 'AddMeetingInProgressStatus1719460000000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE \`meetings\`
      MODIFY COLUMN \`status\` enum('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','ARCHIVED')
      NOT NULL DEFAULT 'SCHEDULED'
    `);
        await queryRunner.query('ALTER TABLE `meetings` ADD `actual_start_time` datetime NULL');
        await queryRunner.query('ALTER TABLE `meetings` ADD `actual_end_time` datetime NULL');
        await queryRunner.query('ALTER TABLE `meetings` ADD `auto_completed` tinyint(1) NOT NULL DEFAULT 0');
    }
    async down(queryRunner) {
        await queryRunner.query('ALTER TABLE `meetings` DROP COLUMN `auto_completed`');
        await queryRunner.query('ALTER TABLE `meetings` DROP COLUMN `actual_end_time`');
        await queryRunner.query('ALTER TABLE `meetings` DROP COLUMN `actual_start_time`');
        await queryRunner.query("UPDATE `meetings` SET `status` = 'COMPLETED' WHERE `status` = 'IN_PROGRESS'");
        await queryRunner.query(`
      ALTER TABLE \`meetings\`
      MODIFY COLUMN \`status\` enum('SCHEDULED','COMPLETED','CANCELLED','ARCHIVED')
      NOT NULL DEFAULT 'SCHEDULED'
    `);
    }
}
exports.AddMeetingInProgressStatus1719460000000 = AddMeetingInProgressStatus1719460000000;
//# sourceMappingURL=1719460000000-AddMeetingInProgressStatus.js.map