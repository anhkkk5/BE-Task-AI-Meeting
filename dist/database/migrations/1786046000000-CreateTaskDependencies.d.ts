import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateTaskDependencies1786046000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
