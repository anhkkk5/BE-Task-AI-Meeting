import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateDailyUpdatesTable1718820000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
