"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectsTable1718580000000 = void 0;
class CreateProjectsTable1718580000000 {
    name = 'CreateProjectsTable1718580000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE projects (
        id varchar(36) NOT NULL,
        workspace_id varchar(36) NOT NULL,
        name varchar(150) NOT NULL,
        key_code varchar(20) NOT NULL,
        description varchar(1000) NULL,
        status enum('ACTIVE', 'ARCHIVED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
        start_date date NULL,
        end_date date NULL,
        created_by varchar(36) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at datetime(6) NULL,
        INDEX IDX_projects_workspace_id (workspace_id),
        INDEX IDX_projects_created_by (created_by),
        INDEX IDX_projects_status (status),
        UNIQUE INDEX IDX_projects_workspace_key_code (workspace_id, key_code),
        PRIMARY KEY (id),
        CONSTRAINT FK_projects_workspace_id FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        CONSTRAINT FK_projects_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE projects');
    }
}
exports.CreateProjectsTable1718580000000 = CreateProjectsTable1718580000000;
//# sourceMappingURL=1718580000000-CreateProjectsTable.js.map