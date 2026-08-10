import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskDependency } from '../entities/task-dependency.entity';
import { TaskDependencyType } from '../../../common/enums/task-dependency-type.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';

@Injectable()
export class TaskDependenciesRepository {
  constructor(@InjectRepository(TaskDependency) private readonly repository: Repository<TaskDependency>) {}
  create(data: Partial<TaskDependency>) { return this.repository.save(this.repository.create(data)); }
  findDuplicate(sourceTaskId: string, targetTaskId: string, type: TaskDependency['type']) { return this.repository.findOne({ where: { sourceTaskId, targetTaskId, type } }); }
  findByTask(taskId: string) {
    return this.repository.createQueryBuilder('dependency')
      .leftJoinAndSelect('dependency.sourceTask', 'sourceTask')
      .leftJoinAndSelect('dependency.targetTask', 'targetTask')
      .where('dependency.source_task_id = :taskId OR dependency.target_task_id = :taskId', { taskId })
      .orderBy('dependency.created_at', 'DESC').getMany();
  }
  findByProject(projectId: string) {
    return this.repository.createQueryBuilder('dependency')
      .innerJoin('dependency.sourceTask', 'sourceTask')
      .where('sourceTask.project_id = :projectId', { projectId }).getMany();
  }
  findOwned(id: string) { return this.repository.findOne({ where: { id } }); }
  remove(item: TaskDependency) { return this.repository.remove(item); }
  findIncompleteBlockers(taskId: string) {
    return this.repository.createQueryBuilder('dependency')
      .leftJoinAndSelect('dependency.sourceTask', 'sourceTask')
      .leftJoinAndSelect('dependency.targetTask', 'targetTask')
      .where('(dependency.type = :dependsOn AND dependency.source_task_id = :taskId AND targetTask.status != :done)', { dependsOn: TaskDependencyType.DependsOn, taskId, done: TaskStatus.Done })
      .orWhere('(dependency.type = :blocks AND dependency.target_task_id = :taskId AND sourceTask.status != :done)', { blocks: TaskDependencyType.Blocks, taskId, done: TaskStatus.Done })
      .getMany();
  }
  findTasksUnblockedBy(blockerTaskId: string) {
    return this.repository.createQueryBuilder('dependency')
      .leftJoinAndSelect('dependency.sourceTask', 'sourceTask')
      .leftJoinAndSelect('dependency.targetTask', 'targetTask')
      .where('(dependency.type = :blocks AND dependency.source_task_id = :taskId)', { blocks: TaskDependencyType.Blocks, taskId: blockerTaskId })
      .orWhere('(dependency.type = :dependsOn AND dependency.target_task_id = :taskId)', { dependsOn: TaskDependencyType.DependsOn, taskId: blockerTaskId })
      .getMany();
  }
}
