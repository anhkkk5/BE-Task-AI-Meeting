import { TaskPriority } from '../../../common/enums/task-priority.enum';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    sprintId?: string;
    assigneeId?: string;
    priority?: TaskPriority;
    dueDate?: string;
    estimatedHours?: number;
    storyPoints?: number;
}
