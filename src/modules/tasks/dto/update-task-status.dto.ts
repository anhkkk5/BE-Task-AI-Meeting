import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TaskStatus } from '../../../common/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.InProgress,
    description: 'Trang thai moi cua task.',
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional() @IsBoolean() overrideBlocked?: boolean;
  @IsOptional() @IsString() @MinLength(5) @MaxLength(500) overrideReason?: string;
}
