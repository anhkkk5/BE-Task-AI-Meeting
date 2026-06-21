import { TaskPriority } from '../../../common/enums/task-priority.enum';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    estimatedHours?: number;
    storyPoints?: number;
}
