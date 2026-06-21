"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTasksTable1718740000000 = void 0;
class CreateTasksTable1718740000000 {
    name = 'CreateTasksTable1718740000000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE tasks (
        id varchar(36) NOT NULL,
        project_id varchar(36) NOT NULL,
        sprint_id varchar(36) NULL,
        task_code varchar(40) NOT NULL,
        title varchar(200) NOT NULL,
        description varchar(2000) NULL,
        status enum('BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'BACKLOG',
        priority enum('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
        assignee_id varchar(36) NULL,
        created_by varchar(36) NOT NULL,
        due_date date NULL,
        estimated_hours float NULL,
        story_points int NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at datetime(6) NULL,
        UNIQUE INDEX IDX_tasks_project_task_code (project_id, task_code),
        INDEX IDX_tasks_project_id (project_id),
        INDEX IDX_tasks_sprint_id (sprint_id),
        INDEX IDX_tasks_assignee_id (assignee_id),
        INDEX IDX_tasks_created_by (created_by),
        INDEX IDX_tasks_status (status),
        INDEX IDX_tasks_priority (priority),
        PRIMARY KEY (id),
        CONSTRAINT FK_tasks_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT FK_tasks_sprint_id FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL,
        CONSTRAINT FK_tasks_assignee_id FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT FK_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE tasks');
    }
}
exports.CreateTasksTable1718740000000 = CreateTasksTable1718740000000;
//# sourceMappingURL=1718740000000-CreateTasksTable.js.map