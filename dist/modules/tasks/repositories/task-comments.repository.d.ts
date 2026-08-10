import { Repository } from 'typeorm';
import { TaskComment } from '../entities/task-comment.entity';
export declare class TaskCommentsRepository {
    private readonly repository;
    constructor(repository: Repository<TaskComment>);
    create(data: Pick<TaskComment, 'taskId' | 'authorId' | 'content' | 'mentionedUserIds'>): Promise<TaskComment>;
    findByTask(taskId: string): Promise<TaskComment[]>;
    findById(id: string, taskId: string): Promise<TaskComment | null>;
    update(comment: TaskComment, data: Partial<TaskComment>): Promise<TaskComment>;
    softDelete(comment: TaskComment): Promise<TaskComment>;
}
