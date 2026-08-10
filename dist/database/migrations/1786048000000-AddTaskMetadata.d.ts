import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddTaskMetadata1786048000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
