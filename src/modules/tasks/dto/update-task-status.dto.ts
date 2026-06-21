import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TaskStatus } from '../../../common/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.InProgress,
    description: 'Trang thai moi cua task.',
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
