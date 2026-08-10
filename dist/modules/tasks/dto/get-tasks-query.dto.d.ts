import { TaskStatus } from '../../../common/enums/task-status.enum';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
export declare enum TaskDependencyStateFilter {
    Blocked = "BLOCKED",
    Blocking = "BLOCKING"
}
export declare class GetTasksQueryDto {
    sprintId?: string;
    status?: TaskStatus;
    assigneeId?: string;
    keyword?: string;
    dependencyState?: TaskDependencyStateFilter;
    taskType?: TaskType;
    priority?: TaskPriority;
    parentId?: string;
    page?: number;
    limit?: number;
}
