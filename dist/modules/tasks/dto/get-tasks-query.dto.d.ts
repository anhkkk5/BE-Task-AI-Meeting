import { TaskStatus } from '../../../common/enums/task-status.enum';
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
    page?: number;
    limit?: number;
}
