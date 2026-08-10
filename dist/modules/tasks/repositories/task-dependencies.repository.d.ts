import { Repository } from 'typeorm';
import { TaskDependency } from '../entities/task-dependency.entity';
export declare class TaskDependenciesRepository {
    private readonly repository;
    constructor(repository: Repository<TaskDependency>);
    create(data: Partial<TaskDependency>): Promise<TaskDependency>;
    findDuplicate(sourceTaskId: string, targetTaskId: string, type: TaskDependency['type']): Promise<TaskDependency | null>;
    findByTask(taskId: string): Promise<TaskDependency[]>;
    findByProject(projectId: string): Promise<TaskDependency[]>;
    findOwned(id: string): Promise<TaskDependency | null>;
    remove(item: TaskDependency): Promise<TaskDependency>;
    findIncompleteBlockers(taskId: string): Promise<TaskDependency[]>;
    findTasksUnblockedBy(blockerTaskId: string): Promise<TaskDependency[]>;
}
