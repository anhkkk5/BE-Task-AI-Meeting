import { TaskStatus } from '../../../common/enums/task-status.enum';
export declare class GetTasksQueryDto {
    sprintId?: string;
    status?: TaskStatus;
    assigneeId?: string;
    keyword?: string;
    page?: number;
    limit?: number;
}
