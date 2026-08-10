import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TaskComment } from '../entities/task-comment.entity';

@Injectable()
export class TaskCommentsRepository {
  constructor(
    @InjectRepository(TaskComment)
    private readonly repository: Repository<TaskComment>,
  ) {}

  create(data: Pick<TaskComment, 'taskId' | 'authorId' | 'content' | 'mentionedUserIds'>) {
    return this.repository.save(this.repository.create(data));
  }

  findByTask(taskId: string) {
    return this.repository.find({
      where: { taskId, deletedAt: IsNull() },
      relations: { author: true },
      order: { createdAt: 'ASC' },
      take: 200,
    });
  }

  findById(id: string, taskId: string) {
    return this.repository.findOne({
      where: { id, taskId, deletedAt: IsNull() },
      relations: { author: true },
    });
  }

  update(comment: TaskComment, data: Partial<TaskComment>) {
    Object.assign(comment, data);
    return this.repository.save(comment);
  }

  softDelete(comment: TaskComment) {
    return this.repository.softRemove(comment);
  }
}
