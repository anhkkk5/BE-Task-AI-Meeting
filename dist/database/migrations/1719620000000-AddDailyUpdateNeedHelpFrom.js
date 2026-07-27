"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDailyUpdateNeedHelpFrom1719620000000 = void 0;
class AddDailyUpdateNeedHelpFrom1719620000000 {
    name = 'AddDailyUpdateNeedHelpFrom1719620000000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE \`daily_updates\`
      ADD COLUMN \`need_help_from_id\` varchar(36) NULL AFTER \`blockers\`
    `);
        await queryRunner.query(`
      CREATE INDEX \`IDX_daily_updates_need_help_from_id\`
      ON \`daily_updates\` (\`need_help_from_id\`)
    `);
        await queryRunner.query(`
      ALTER TABLE \`daily_updates\`
      ADD CONSTRAINT \`FK_daily_updates_need_help_from_id\`
      FOREIGN KEY (\`need_help_from_id\`) REFERENCES \`users\` (\`id\`)
      ON DELETE SET NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE \`daily_updates\`
      DROP FOREIGN KEY \`FK_daily_updates_need_help_from_id\`
    `);
        await queryRunner.query(`
      DROP INDEX \`IDX_daily_updates_need_help_from_id\` ON \`daily_updates\`
    `);
        await queryRunner.query(`
      ALTER TABLE \`daily_updates\` DROP COLUMN \`need_help_from_id\`
    `);
    }
}
exports.AddDailyUpdateNeedHelpFrom1719620000000 = AddDailyUpdateNeedHelpFrom1719620000000;
//# sourceMappingURL=1719620000000-AddDailyUpdateNeedHelpFrom.js.map