import { IsEnum, IsUUID } from 'class-validator';
import { TaskDependencyType } from '../../../common/enums/task-dependency-type.enum';

export class CreateTaskDependencyDto {
  @IsUUID() targetTaskId: string;
  @IsEnum(TaskDependencyType) type: TaskDependencyType;
}
