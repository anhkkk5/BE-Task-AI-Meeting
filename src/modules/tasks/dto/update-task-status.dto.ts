import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { TaskStatus } from '../../../common/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.InProgress,
    description: 'Trang thai moi cua task.',
  })
  @ValidateIf((value: UpdateTaskStatusDto) => !value.workflowStatusId)
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ required: false, description: 'Workflow status UUID. Ưu tiên trường này cho workflow động.' })
  @ValidateIf((value: UpdateTaskStatusDto) => !value.status)
  @IsUUID()
  workflowStatusId?: string;

  @IsOptional() @IsBoolean() overrideBlocked?: boolean;
  @IsOptional() @IsString() @MinLength(5) @MaxLength(500) overrideReason?: string;
}
