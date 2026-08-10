import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
export declare class CreateTaskDto {
    labels?: string[];
    acceptanceCriteria?: string;
    reporterId?: string;
    taskType?: TaskType;
    priority?: TaskPriority;
    parentId?: string;
    title: string;
    description?: string;
    sprintId?: string;
    assigneeId?: string;
    dueDate?: string;
    estimatedHours?: number;
    storyPoints?: number;
}
