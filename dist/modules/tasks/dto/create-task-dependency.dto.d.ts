import { TaskDependencyType } from '../../../common/enums/task-dependency-type.enum';
export declare class CreateTaskDependencyDto {
    targetTaskId: string;
    type: TaskDependencyType;
}
