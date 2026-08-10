import { TaskStatus } from '../../../common/enums/task-status.enum';
export declare class UpdateTaskStatusDto {
    status?: TaskStatus;
    workflowStatusId?: string;
    overrideBlocked?: boolean;
    overrideReason?: string;
}
