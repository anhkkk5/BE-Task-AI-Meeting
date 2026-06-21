import { Injectable } from '@nestjs/common';
import { Project } from '../../projects/entities/project.entity';
import { TasksRepository } from '../repositories/tasks.repository';

@Injectable()
export class TaskCodeService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async generateTaskCode(project: Project) {
    const count = await this.tasksRepository.countByProject(project.id);
    return `${project.keyCode}-${count + 1}`;
  }
}
