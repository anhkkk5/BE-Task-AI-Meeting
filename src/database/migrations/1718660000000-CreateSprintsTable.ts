import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSprintsTable1718660000000 implements MigrationInterface {
  name = 'CreateSprintsTable1718660000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE sprints (
        id varchar(36) NOT NULL,
        project_id varchar(36) NOT NULL,
        name varchar(150) NOT NULL,
        goal varchar(1000) NULL,
        status enum('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
        start_date date NOT NULL,
        end_date date NOT NULL,
        started_at datetime NULL,
        completed_at datetime NULL,
        created_by varchar(36) NOT NULL,
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deleted_at datetime(6) NULL,
        INDEX IDX_sprints_project_id (project_id),
        INDEX IDX_sprints_created_by (created_by),
        INDEX IDX_sprints_status (status),
        PRIMARY KEY (id),
        CONSTRAINT FK_sprints_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT FK_sprints_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE sprints');
  }
}
