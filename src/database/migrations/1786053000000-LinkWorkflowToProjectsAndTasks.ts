import { MigrationInterface, QueryRunner } from 'typeorm';
export class LinkWorkflowToProjectsAndTasks1786053000000 implements MigrationInterface {
  name = 'LinkWorkflowToProjectsAndTasks1786053000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      "INSERT INTO `workflow_templates` (`id`,`name`,`description`,`is_system`) VALUES ('00000000-0000-4000-8000-000000000001','Scrum mặc định','Workflow Scrum chuẩn',1)",
    );
    const statuses = [
      ['11', 'BACKLOG', 'Backlog', '#6b778c', 'TO_DO', 0],
      ['12', 'TODO', 'Cần làm', '#0c66e4', 'TO_DO', 1],
      ['13', 'IN_PROGRESS', 'Đang làm', '#e56910', 'IN_PROGRESS', 2],
      ['14', 'REVIEW', 'Review', '#7e4ec8', 'IN_PROGRESS', 3],
      ['15', 'DONE', 'Hoàn thành', '#22a06b', 'DONE', 4],
      ['16', 'CANCELLED', 'Đã hủy', '#c9372c', 'DONE', 5],
    ];
    for (const [suffix, key, label, color, category, order] of statuses)
      await q.query(
        'INSERT INTO `workflow_statuses` (`id`,`template_id`,`status_key`,`label`,`color`,`category`,`sort_order`,`enabled`) VALUES (?,?,?,?,?,?,?,1)',
        [
          `00000000-0000-4000-8000-0000000000${suffix}`,
          '00000000-0000-4000-8000-000000000001',
          key,
          label,
          color,
          category,
          order,
        ],
      );
    const transitions = [
      ['21', 'BACKLOG', 'TODO'],
      ['22', 'TODO', 'BACKLOG'],
      ['23', 'TODO', 'IN_PROGRESS'],
      ['24', 'IN_PROGRESS', 'TODO'],
      ['25', 'IN_PROGRESS', 'REVIEW'],
      ['26', 'REVIEW', 'IN_PROGRESS'],
      ['27', 'REVIEW', 'DONE'],
      ['28', 'DONE', 'IN_PROGRESS'],
    ];
    for (const [suffix, from, to] of transitions)
      await q.query(
        'INSERT INTO `workflow_transitions` (`id`,`template_id`,`from_key`,`to_key`,`allowed_roles`) VALUES (?,?,?,?,NULL)',
        [
          `00000000-0000-4000-8000-0000000000${suffix}`,
          '00000000-0000-4000-8000-000000000001',
          from,
          to,
        ],
      );
    await q.query(
      'ALTER TABLE `projects` ADD `workflow_template_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL',
    );
    await q.query(
      'ALTER TABLE `tasks` ADD `workflow_status_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL',
    );
    await q.query(
      "UPDATE `projects` SET `workflow_template_id`='00000000-0000-4000-8000-000000000001' WHERE `workflow_template_id` IS NULL",
    );
    await q.query(
      "UPDATE `tasks` t JOIN `workflow_statuses` s ON s.template_id='00000000-0000-4000-8000-000000000001' AND s.status_key=t.status SET t.workflow_status_id=s.id",
    );
    await q.query(
      'ALTER TABLE `projects` ADD CONSTRAINT `FK_project_workflow_template` FOREIGN KEY (`workflow_template_id`) REFERENCES `workflow_templates`(`id`) ON DELETE SET NULL',
    );
    await q.query(
      'ALTER TABLE `tasks` ADD CONSTRAINT `FK_task_workflow_status` FOREIGN KEY (`workflow_status_id`) REFERENCES `workflow_statuses`(`id`) ON DELETE SET NULL',
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(
      'ALTER TABLE `tasks` DROP FOREIGN KEY `FK_task_workflow_status`',
    );
    await q.query(
      'ALTER TABLE `projects` DROP FOREIGN KEY `FK_project_workflow_template`',
    );
    await q.query('ALTER TABLE `tasks` DROP COLUMN `workflow_status_id`');
    await q.query('ALTER TABLE `projects` DROP COLUMN `workflow_template_id`');
  }
}
