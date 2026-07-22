"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddShiftHandoverSoftDelete1719140000000 = void 0;
const typeorm_1 = require("typeorm");
class AddShiftHandoverSoftDelete1719140000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('shift_handovers', new typeorm_1.TableColumn({
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
        }));
        await queryRunner.createIndex('shift_handovers', new typeorm_1.TableIndex({
            name: 'IDX_shift_handovers_deleted_at',
            columnNames: ['deleted_at'],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropIndex('shift_handovers', 'IDX_shift_handovers_deleted_at');
        await queryRunner.dropColumn('shift_handovers', 'deleted_at');
    }
}
exports.AddShiftHandoverSoftDelete1719140000000 = AddShiftHandoverSoftDelete1719140000000;
//# sourceMappingURL=1719140000000-AddShiftHandoverSoftDelete.js.map