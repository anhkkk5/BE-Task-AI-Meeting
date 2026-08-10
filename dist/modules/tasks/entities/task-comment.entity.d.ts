import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';
export declare class TaskComment {
    id: string;
    taskId: string;
    authorId: string;
    content: string;
    mentionedUserIds: string[] | null;
    task: Task;
    author: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
