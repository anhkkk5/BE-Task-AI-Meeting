"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserProfileFields1718420000000 = void 0;
class AddUserProfileFields1718420000000 {
    name = 'AddUserProfileFields1718420000000';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE users
        ADD avatar_url varchar(500) NULL,
        ADD phone_number varchar(30) NULL,
        ADD job_title varchar(120) NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN job_title,
        DROP COLUMN phone_number,
        DROP COLUMN avatar_url
    `);
    }
}
exports.AddUserProfileFields1718420000000 = AddUserProfileFields1718420000000;
//# sourceMappingURL=1718420000000-AddUserProfileFields.js.map