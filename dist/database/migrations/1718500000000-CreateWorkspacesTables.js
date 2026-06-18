"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkspacesTables1718500000000 = void 0;
class CreateWorkspacesTables1718500000000 {
    name = 'CreateWorkspacesTables1718500000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE workspaces (
        id varchar(36) NOT NULL,
        name varchar(100) NOT NULL,
        slug varchar(140) NOT NULL,
        description varchar(500) NULL,
        owner_id varchar(36) NOT NULL,
        plan enum('FREE', 'PRO', 'ENTERPRISE') NOT NULL DEFAULT 'FREE',
        status enum('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at datetime(6) NULL,
        UNIQUE INDEX IDX_workspaces_slug (slug),
        INDEX IDX_workspaces_owner_id (owner_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_workspaces_owner_id FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
        await queryRunner.query(`
      CREATE TABLE workspace_members (
        id varchar(36) NOT NULL,
        workspace_id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        role enum('OWNER', 'SCRUM_MASTER', 'PROJECT_MANAGER', 'MEMBER', 'VIEWER') NOT NULL,
        status enum('ACTIVE', 'INVITED', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
        joined_at datetime NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX IDX_workspace_members_workspace_id (workspace_id),
        INDEX IDX_workspace_members_user_id (user_id),
        UNIQUE INDEX IDX_workspace_members_workspace_user (workspace_id, user_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_workspace_members_workspace_id FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        CONSTRAINT FK_workspace_members_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE workspace_members');
        await queryRunner.query('DROP TABLE workspaces');
    }
}
exports.CreateWorkspacesTables1718500000000 = CreateWorkspacesTables1718500000000;
//# sourceMappingURL=1718500000000-CreateWorkspacesTables.js.map