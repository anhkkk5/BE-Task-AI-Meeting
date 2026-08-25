import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddDailyUpdateReviewWorkflow1787620000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
