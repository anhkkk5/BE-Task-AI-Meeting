import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
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
    >,
  ) {
    const task = this.repository.create(data);
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
        creator: true,
        sprint: true,
      },
    });
  }

  async findByProject(projectId: string, query: GetTasksQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.sprint', 'sprint')
      .where('task.projectId = :projectId', { projectId })
      .andWhere('task.deletedAt IS NULL');

    if (query.sprintId) {
      builder.andWhere('task.sprintId = :sprintId', {
        sprintId: query.sprintId,
      });
    }

    if (query.status) {
      builder.andWhere('task.status = :status', { status: query.status });
    }

    if (query.assigneeId) {
      builder.andWhere('task.assigneeId = :assigneeId', {
        assigneeId: query.assigneeId,
      });
    }

    if (query.keyword?.trim()) {
      const keyword = `%${query.keyword.trim()}%`;
      builder.andWhere(
        '(task.title LIKE :keyword OR task.taskCode LIKE :keyword)',
        { keyword },
      );
    }

    const [items, total] = await builder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findBacklogByProject(projectId: string) {
    return this.repository.find({
      where: {
        projectId,
        sprintId: IsNull(),
        status: Not(TaskStatus.Cancelled),
        deletedAt: IsNull(),
      },
      relations: {
        assignee: true,
        creator: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findBySprint(projectId: string, sprintId: string) {
    return this.repository.find({
      where: {
        projectId,
        sprintId,
        deletedAt: IsNull(),
      },
      relations: {
        assignee: true,
        creator: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(task: Task, data: Partial<Task>) {
    Object.assign(task, data);
    return this.repository.save(task);
  }

  softDelete(task: Task) {
    return this.repository.softRemove(task);
  }
}
