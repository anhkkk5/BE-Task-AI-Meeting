import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddAuthSessionsAndLoginAudit1786057000000 implements MigrationInterface {
    name: string;
    up(q: QueryRunner): Promise<void>;
    down(q: QueryRunner): Promise<void>;
}
