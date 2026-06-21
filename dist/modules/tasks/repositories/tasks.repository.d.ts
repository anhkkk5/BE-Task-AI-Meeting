import { Repository } from 'typeorm';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import { Task } from '../entities/task.entity';
export declare class TasksRepository {
    private readonly repository;
    constructor(repository: Repository<Task>);
    create(data: Pick<Task, 'assigneeId' | 'createdBy' | 'description' | 'dueDate' | 'estimatedHours' | 'priority' | 'projectId' | 'sprintId' | 'status' | 'storyPoints' | 'taskCode' | 'title'>): Promise<Task>;
    countByProject(projectId: string): Promise<number>;
    findByIdAndProject(taskId: string, projectId: string): Promise<Task | null>;
    findByProject(projectId: string, query: GetTasksQueryDto): Promise<{
        items: Task[];
        total: number;
        page: number;
        limit: number;
    }>;
    findBacklogByProject(projectId: string): Promise<Task[]>;
    findBySprint(projectId: string, sprintId: string): Promise<Task[]>;
    update(task: Task, data: Partial<Task>): Promise<Task>;
}
