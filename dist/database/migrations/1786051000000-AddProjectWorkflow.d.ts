import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddProjectWorkflow1786051000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
