import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
export declare class GetTasksQueryDto {
    sprintId?: string;
    status?: TaskStatus;
    assigneeId?: string;
    priority?: TaskPriority;
    keyword?: string;
    page?: number;
    limit?: number;
}
