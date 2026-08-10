import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
export declare class UpdateTaskDto {
    labels?: string[];
    acceptanceCriteria?: string;
    reporterId?: string | null;
    taskType?: TaskType;
    priority?: TaskPriority;
    parentId?: string | null;
    title?: string;
    description?: string;
    dueDate?: string;
    estimatedHours?: number;
    storyPoints?: number;
}
