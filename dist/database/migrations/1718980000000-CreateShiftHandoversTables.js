"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateShiftHandoversTables1718980000000 = void 0;
class CreateShiftHandoversTables1718980000000 {
    name = 'CreateShiftHandoversTables1718980000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE shifts (
        id varchar(36) NOT NULL,
        workspace_id varchar(36) NOT NULL,
        project_id varchar(36) NOT NULL,
        name varchar(120) NOT NULL,
        shift_date date NOT NULL,
        start_at datetime NOT NULL,
        end_at datetime NOT NULL,
        status enum('SCHEDULED','ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
        notes varchar(500) NULL,
        created_by varchar(36) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at datetime(6) NULL,
        INDEX IDX_shifts_workspace (workspace_id),
        INDEX IDX_shifts_project (project_id),
        INDEX IDX_shifts_date (shift_date),
        INDEX IDX_shifts_status (status),
        INDEX IDX_shifts_creator (created_by),
        PRIMARY KEY (id),
        CONSTRAINT FK_shifts_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        CONSTRAINT FK_shifts_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT FK_shifts_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
        await queryRunner.query(`
      CREATE TABLE shift_assignments (
        id varchar(36) NOT NULL,
        shift_id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX IDX_shift_assignments_shift (shift_id),
        INDEX IDX_shift_assignments_user (user_id),
        UNIQUE INDEX IDX_shift_assignments_unique (shift_id, user_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_shift_assignments_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
        CONSTRAINT FK_shift_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
        await queryRunner.query(`
      CREATE TABLE shift_handovers (
        id varchar(36) NOT NULL,
        workspace_id varchar(36) NOT NULL,
        project_id varchar(36) NOT NULL,
        source_shift_id varchar(36) NOT NULL,
        target_shift_id varchar(36) NULL,
        sender_id varchar(36) NOT NULL,
        receiver_id varchar(36) NOT NULL,
        title varchar(200) NOT NULL,
        summary text NULL,
        status enum('DRAFT','PENDING','CHANGES_REQUESTED','ACKNOWLEDGED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
        change_request varchar(1000) NULL,
        submitted_at datetime NULL,
        acknowledged_at datetime NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX IDX_handovers_workspace (workspace_id),
        INDEX IDX_handovers_project (project_id),
        INDEX IDX_handovers_source_shift (source_shift_id),
        INDEX IDX_handovers_sender (sender_id),
        INDEX IDX_handovers_receiver (receiver_id),
        INDEX IDX_handovers_status (status),
        PRIMARY KEY (id),
        CONSTRAINT FK_handovers_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        CONSTRAINT FK_handovers_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT FK_handovers_source_shift FOREIGN KEY (source_shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
        CONSTRAINT FK_handovers_target_shift FOREIGN KEY (target_shift_id) REFERENCES shifts(id) ON DELETE SET NULL,
        CONSTRAINT FK_handovers_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT FK_handovers_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
        await queryRunner.query(`
      CREATE TABLE handover_items (
        id varchar(36) NOT NULL,
        handover_id varchar(36) NOT NULL,
        task_id varchar(36) NULL,
        assignee_id varchar(36) NULL,
        type enum('TASK','INCIDENT','BLOCKER','FOLLOW_UP','NOTE') NOT NULL,
        priority enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
        title varchar(200) NOT NULL,
        description varchar(2000) NULL,
        due_at datetime NULL,
        is_resolved tinyint NOT NULL DEFAULT 0,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX IDX_handover_items_handover (handover_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_handover_items_handover FOREIGN KEY (handover_id) REFERENCES shift_handovers(id) ON DELETE CASCADE,
        CONSTRAINT FK_handover_items_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
        CONSTRAINT FK_handover_items_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE handover_items');
        await queryRunner.query('DROP TABLE shift_handovers');
        await queryRunner.query('DROP TABLE shift_assignments');
        await queryRunner.query('DROP TABLE shifts');
    }
}
exports.CreateShiftHandoversTables1718980000000 = CreateShiftHandoversTables1718980000000;
//# sourceMappingURL=1718980000000-CreateShiftHandoversTables.js.map