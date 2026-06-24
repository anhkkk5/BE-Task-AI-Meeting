import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDailyUpdatesTable1718820000000 implements MigrationInterface {
  name = 'CreateDailyUpdatesTable1718820000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE daily_updates (
        id varchar(36) NOT NULL,
        workspace_id varchar(36) NOT NULL,
        project_id varchar(36) NOT NULL,
        sprint_id varchar(36) NULL,
        user_id varchar(36) NOT NULL,
        update_date date NOT NULL,
        yesterday_work text NOT NULL,
        today_plan text NOT NULL,
        blockers text NULL,
        notes text NULL,
        mood enum('GOOD', 'NORMAL', 'BLOCKED', 'TIRED') NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at datetime(6) NULL,
        UNIQUE INDEX IDX_daily_updates_unique_day (workspace_id, project_id, user_id, update_date),
        INDEX IDX_daily_updates_workspace_id (workspace_id),
        INDEX IDX_daily_updates_project_id (project_id),
        INDEX IDX_daily_updates_sprint_id (sprint_id),
        INDEX IDX_daily_updates_user_id (user_id),
        INDEX IDX_daily_updates_update_date (update_date),
        INDEX IDX_daily_updates_mood (mood),
        PRIMARY KEY (id),
        CONSTRAINT FK_daily_updates_workspace_id FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        CONSTRAINT FK_daily_updates_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT FK_daily_updates_sprint_id FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL,
        CONSTRAINT FK_daily_updates_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE daily_updates');
  }
}
