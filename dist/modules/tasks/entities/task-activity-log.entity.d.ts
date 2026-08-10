import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';
export declare enum TaskActivityAction {
    Created = "CREATED",
    Updated = "UPDATED",
    StatusChanged = "STATUS_CHANGED",
    Assigned = "ASSIGNED",
    SprintMoved = "SPRINT_MOVED",
    Cancelled = "CANCELLED",
    Deleted = "DELETED",
    Commented = "COMMENTED",
    CommentUpdated = "COMMENT_UPDATED",
    CommentDeleted = "COMMENT_DELETED"
}
export declare class TaskActivityLog {
    id: string;
    taskId: string;
    projectId: string;
    actorId: string;
    action: TaskActivityAction;
    changes: Record<string, {
        from: unknown;
        to: unknown;
    }> | null;
    task: Task;
    actor: User;
    createdAt: Date;
}
