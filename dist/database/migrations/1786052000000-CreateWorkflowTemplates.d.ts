import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateWorkflowTemplates1786052000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
