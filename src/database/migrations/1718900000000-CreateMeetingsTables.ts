import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMeetingsTables1718900000000 implements MigrationInterface {
  name = 'CreateMeetingsTables1718900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE meetings (
        id varchar(36) NOT NULL,
        workspace_id varchar(36) NOT NULL,
        project_id varchar(36) NOT NULL,
        sprint_id varchar(36) NULL,
        title varchar(200) NOT NULL,
        description varchar(1000) NULL,
        meeting_type enum('SPRINT_PLANNING', 'DAILY_SCRUM', 'SPRINT_REVIEW', 'RETROSPECTIVE', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
        meeting_date date NOT NULL,
        start_time datetime NULL,
        end_time datetime NULL,
        status enum('SCHEDULED', 'COMPLETED', 'CANCELLED', 'ARCHIVED') NOT NULL DEFAULT 'SCHEDULED',
        created_by varchar(36) NOT NULL,
        mongo_transcript_id varchar(100) NULL,
        mongo_summary_id varchar(100) NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at datetime(6) NULL,
        INDEX IDX_meetings_workspace_id (workspace_id),
        INDEX IDX_meetings_project_id (project_id),
        INDEX IDX_meetings_sprint_id (sprint_id),
        INDEX IDX_meetings_meeting_type (meeting_type),
        INDEX IDX_meetings_meeting_date (meeting_date),
        INDEX IDX_meetings_status (status),
        INDEX IDX_meetings_created_by (created_by),
        PRIMARY KEY (id),
        CONSTRAINT FK_meetings_workspace_id FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        CONSTRAINT FK_meetings_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT FK_meetings_sprint_id FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL,
        CONSTRAINT FK_meetings_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE meeting_participants (
        id varchar(36) NOT NULL,
        meeting_id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        role enum('HOST', 'PARTICIPANT', 'NOTE_TAKER') NOT NULL DEFAULT 'PARTICIPANT',
        attended tinyint NOT NULL DEFAULT 0,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX IDX_meeting_participants_meeting_id (meeting_id),
        INDEX IDX_meeting_participants_user_id (user_id),
        UNIQUE INDEX IDX_meeting_participants_meeting_user (meeting_id, user_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_meeting_participants_meeting_id FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
        CONSTRAINT FK_meeting_participants_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE meeting_participants');
    await queryRunner.query('DROP TABLE meetings');
  }
}
