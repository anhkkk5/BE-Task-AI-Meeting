import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { GetTasksQueryDto, TaskDependencyStateFilter } from '../dto/get-tasks-query.dto';
import { Task } from '../entities/task.entity';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
  ) {}

  create(
    data: Pick<
      Task,
      | 'assigneeId'
      | 'createdBy'
      | 'description'
      | 'dueDate'
      | 'estimatedHours'
      | 'projectId'
      | 'sprintId'
      | 'status'
      | 'storyPoints'
      | 'taskCode'
      | 'title'
    > & Partial<Pick<Task, 'taskType' | 'priority' | 'parentId' | 'labels' | 'acceptanceCriteria' | 'reporterId' | 'completedAt' | 'startedAt' | 'workflowStatusId'>>,
  ) {
    const task = this.repository.create({
      taskType: data.taskType ?? TaskType.Task,
      priority: data.priority ?? TaskPriority.Medium,
      parentId: data.parentId ?? null,
      ...data,
    });
    return this.repository.save(task);
  }

  countByProject(projectId: string) {
    return this.repository.count({
      where: {
        projectId,
        deletedAt: IsNull(),
      },
    });
  }

  findByIdAndProject(taskId: string, projectId: string) {
    return this.repository.findOne({
      where: {
        id: taskId,
        projectId,
        deletedAt: IsNull(),
      },
      relations: {
        assignee: true,
        reporter: true,
        creator: true,
        sprint: true,
        parent: true,
        children: true,
      },
    });
  }

  async findByProject(projectId: string, query: GetTasksQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.withDependencyState(this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.reporter', 'reporter')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.sprint', 'sprint')
      .leftJoinAndSelect('task.parent', 'parent')
      .leftJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id')
      .addSelect('workflowStatus.status_key', 'task_workflowStatusKey')
      .where('task.projectId = :projectId', { projectId })
      .andWhere('task.deletedAt IS NULL'));

    if (query.sprintId) {
      builder.andWhere('task.sprintId = :sprintId', {
        sprintId: query.sprintId,
      });
    }

    if (query.status) {
      builder.andWhere('workflowStatus.status_key = :status', { status: query.status });
    }

    if (query.assigneeId) {
      builder.andWhere('task.assigneeId = :assigneeId', {
        assigneeId: query.assigneeId,
      });
    }
    if (query.taskType) builder.andWhere('task.taskType = :taskType', { taskType: query.taskType });
    if (query.priority) builder.andWhere('task.priority = :priority', { priority: query.priority });
    if (query.parentId) builder.andWhere('task.parentId = :parentId', { parentId: query.parentId });

    if (query.keyword?.trim()) {
      const keyword = `%${query.keyword.trim()}%`;
      builder.andWhere(
        '(task.title LIKE :keyword OR task.taskCode LIKE :keyword)',
        { keyword },
      );
    }

    if (query.dependencyState === TaskDependencyStateFilter.Blocked) {
      builder.andWhere(this.blockedExistsSql('task'));
    } else if (query.dependencyState === TaskDependencyStateFilter.Blocking) {
      builder.andWhere(this.blockingExistsSql('task'));
    }

    const total = await builder.getCount();
    const result = await builder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();
    const items = this.attachDependencyState(result.entities, result.raw);

    return { items, total, page, limit };
  }

  async findBacklogByProject(projectId: string) {
    const result = await this.withDependencyState(this.repository.createQueryBuilder('task'))
      .leftJoinAndSelect('task.assignee', 'assignee').leftJoinAndSelect('task.creator', 'creator').leftJoinAndSelect('task.reporter', 'reporter')
      .leftJoinAndSelect('task.parent', 'parent')
      .leftJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id').addSelect('workflowStatus.status_key', 'task_workflowStatusKey')
      .where('task.projectId = :projectId', { projectId }).andWhere('task.sprintId IS NULL')
      .andWhere('workflowStatus.status_key != :cancelled', { cancelled: TaskStatus.Cancelled }).andWhere('task.deletedAt IS NULL')
      .orderBy('task.createdAt', 'DESC').getRawAndEntities();
    return this.attachDependencyState(result.entities, result.raw);
  }

  async findBySprint(projectId: string, sprintId: string) {
    const result = await this.withDependencyState(this.repository.createQueryBuilder('task'))
      .leftJoinAndSelect('task.assignee', 'assignee').leftJoinAndSelect('task.creator', 'creator').leftJoinAndSelect('task.reporter', 'reporter')
      .leftJoinAndSelect('task.parent', 'parent')
      .leftJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id').addSelect('workflowStatus.status_key', 'task_workflowStatusKey')
      .where('task.projectId = :projectId', { projectId }).andWhere('task.sprintId = :sprintId', { sprintId })
      .andWhere('task.deletedAt IS NULL').orderBy('task.createdAt', 'DESC').getRawAndEntities();
    return this.attachDependencyState(result.entities, result.raw);
  }

  async update(task: Task, data: Partial<Task>) {
    Object.assign(task, data);
    return this.repository.save(task);
  }

  findIncompleteChildren(parentId: string) {
    return this.repository.createQueryBuilder('task')
      .innerJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id')
      .where('task.parentId = :parentId', { parentId })
      .andWhere('task.deletedAt IS NULL')
      .andWhere('workflowStatus.category != :doneCategory', { doneCategory: 'DONE' })
      .getMany();
  }

  findChildren(parentId: string) {
    return this.repository.find({ where: { parentId, deletedAt: IsNull() } });
  }

  async findWorkflowStatusId(templateId: string | null, status: TaskStatus) {
    if (!templateId) return null;
    const rows = await this.repository.manager.query('SELECT `id` FROM `workflow_statuses` WHERE `template_id` = ? AND `status_key` = ? AND `enabled`=1 LIMIT 1', [templateId, status]) as Array<{ id: string }>;
    return rows[0]?.id ?? null;
  }

  async findWorkflowStatus(templateId: string | null, workflowStatusId: string) {
    if (!templateId) return null;
    const rows = await this.repository.manager.query(
      'SELECT `id`,`status_key` `key`,`label`,`category`,`enabled` FROM `workflow_statuses` WHERE `id`=? AND `template_id`=? LIMIT 1',
      [workflowStatusId, templateId],
    ) as Array<{ id: string; key: TaskStatus; label: string; category: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; enabled: boolean | number }>;
    return rows[0] ?? null;
  }

  async findWorkflowStatusById(workflowStatusId: string | null) {
    if (!workflowStatusId) return null;
    const rows = await this.repository.manager.query(
      'SELECT `id`,`status_key` `key`,`label`,`category`,`enabled` FROM `workflow_statuses` WHERE `id`=? LIMIT 1',
      [workflowStatusId],
    ) as Array<{ id: string; key: TaskStatus; label: string; category: 'TO_DO' | 'IN_PROGRESS' | 'DONE'; enabled: boolean | number }>;
    return rows[0] ?? null;
  }

  findDueNotificationCandidates(throughDate: string) {
    return this.repository.createQueryBuilder('task')
      .innerJoinAndSelect('task.project', 'project')
      .innerJoin('workflow_statuses', 'workflowStatus', 'workflowStatus.id = task.workflow_status_id')
      .where('task.deletedAt IS NULL')
      .andWhere('task.assigneeId IS NOT NULL')
      .andWhere('task.dueDate IS NOT NULL')
      .andWhere('task.dueDate <= :throughDate', { throughDate })
      .andWhere('workflowStatus.category != :doneCategory', { doneCategory: 'DONE' })
      .getMany();
  }

  softDelete(task: Task) {
    return this.repository.softRemove(task);
  }

  private withDependencyState(builder: SelectQueryBuilder<Task>) {
    return builder
      .addSelect(`CASE WHEN ${this.blockedExistsSql('task')} THEN 1 ELSE 0 END`, 'task_isBlocked')
      .addSelect(`CASE WHEN ${this.blockingExistsSql('task')} THEN 1 ELSE 0 END`, 'task_isBlocking');
  }

  private blockedExistsSql(alias: string) {
    return `EXISTS (SELECT 1 FROM task_dependencies dependency LEFT JOIN tasks source_task ON source_task.id = dependency.source_task_id LEFT JOIN workflow_statuses source_status ON source_status.id = source_task.workflow_status_id LEFT JOIN tasks target_task ON target_task.id = dependency.target_task_id LEFT JOIN workflow_statuses target_status ON target_status.id = target_task.workflow_status_id WHERE (dependency.type = 'DEPENDS_ON' AND dependency.source_task_id = ${alias}.id AND target_status.category != 'DONE') OR (dependency.type = 'BLOCKS' AND dependency.target_task_id = ${alias}.id AND source_status.category != 'DONE'))`;
  }

  private blockingExistsSql(alias: string) {
    return `EXISTS (SELECT 1 FROM task_dependencies dependency LEFT JOIN tasks source_task ON source_task.id = dependency.source_task_id LEFT JOIN workflow_statuses source_status ON source_status.id = source_task.workflow_status_id LEFT JOIN tasks target_task ON target_task.id = dependency.target_task_id LEFT JOIN workflow_statuses target_status ON target_status.id = target_task.workflow_status_id WHERE (dependency.type = 'BLOCKS' AND dependency.source_task_id = ${alias}.id AND target_status.category != 'DONE') OR (dependency.type = 'DEPENDS_ON' AND dependency.target_task_id = ${alias}.id AND source_status.category != 'DONE'))`;
  }

  private attachDependencyState(items: Task[], raw: Array<Record<string, unknown>>) {
    return items.map((task, index) => {
      task.isBlocked = Number(raw[index]?.task_isBlocked ?? 0) === 1;
      task.isBlocking = Number(raw[index]?.task_isBlocking ?? 0) === 1;
      task.status = (raw[index]?.task_workflowStatusKey as TaskStatus | undefined) ?? task.status;
      return task;
    });
  }
}
