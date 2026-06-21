import { Project } from '../../projects/entities/project.entity';
import { TasksRepository } from '../repositories/tasks.repository';
export declare class TaskCodeService {
    private readonly tasksRepository;
    constructor(tasksRepository: TasksRepository);
    generateTaskCode(project: Project): Promise<string>;
}
