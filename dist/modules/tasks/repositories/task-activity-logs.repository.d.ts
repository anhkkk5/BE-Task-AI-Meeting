import { Repository } from 'typeorm';
import { TaskActivityAction, TaskActivityLog } from '../entities/task-activity-log.entity';
export declare class TaskActivityLogsRepository {
    private readonly repository;
    constructor(repository: Repository<TaskActivityLog>);
    create(data: {
        taskId: string;
        projectId: string;
        actorId: string;
        action: TaskActivityAction;
        changes?: Record<string, {
            from: unknown;
            to: unknown;
        }> | null;
    }): Promise<TaskActivityLog>;
    findByTask(taskId: string): Promise<TaskActivityLog[]>;
}
