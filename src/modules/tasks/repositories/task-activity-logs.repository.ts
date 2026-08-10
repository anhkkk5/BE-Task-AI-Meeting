import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TaskActivityAction,
  TaskActivityLog,
} from '../entities/task-activity-log.entity';

@Injectable()
export class TaskActivityLogsRepository {
  constructor(
    @InjectRepository(TaskActivityLog)
    private readonly repository: Repository<TaskActivityLog>,
  ) {}

  create(data: {
    taskId: string;
    projectId: string;
    actorId: string;
    action: TaskActivityAction;
    changes?: Record<string, { from: unknown; to: unknown }> | null;
  }) {
    return this.repository.save(this.repository.create(data));
  }

  findByTask(taskId: string) {
    return this.repository.find({
      where: { taskId },
      relations: { actor: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
