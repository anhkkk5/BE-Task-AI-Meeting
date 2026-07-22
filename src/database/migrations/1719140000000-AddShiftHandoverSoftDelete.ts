import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddShiftHandoverSoftDelete1719140000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shift_handovers',
      new TableColumn({
        name: 'deleted_at',
        type: 'datetime',
        isNullable: true,
      }),
    );
    await queryRunner.createIndex(
      'shift_handovers',
      new TableIndex({
        name: 'IDX_shift_handovers_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'shift_handovers',
      'IDX_shift_handovers_deleted_at',
    );
    await queryRunner.dropColumn('shift_handovers', 'deleted_at');
  }
}
