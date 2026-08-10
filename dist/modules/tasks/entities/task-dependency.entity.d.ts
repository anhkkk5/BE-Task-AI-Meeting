import { TaskDependencyType } from '../../../common/enums/task-dependency-type.enum';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';
export declare class TaskDependency {
    id: string;
    sourceTaskId: string;
    targetTaskId: string;
    type: TaskDependencyType;
    createdBy: string;
    sourceTask: Task;
    targetTask: Task;
    creator: User;
    createdAt: Date;
}
