import { TaskStatus } from '../../../common/enums/task-status.enum';
export declare class UpdateTaskStatusDto {
    status: TaskStatus;
    overrideBlocked?: boolean;
    overrideReason?: string;
}
