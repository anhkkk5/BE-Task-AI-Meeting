import { TaskPriority } from '../../../common/enums/task-priority.enum';
export declare class ApproveMeetingActionItemDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
    sprintId?: string;
    dueDate?: string;
    allowDuplicate?: boolean;
}
