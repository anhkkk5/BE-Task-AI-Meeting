import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ApproveMeetingActionItemDto {
  @ApiPropertyOptional({
    description: 'Tieu de task. Bo trong de dung noi dung AI de xuat.',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional() @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'User UUID se duoc gan task.' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Sprint UUID. Bo trong de tao task trong backlog.',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiPropertyOptional({ example: '2026-07-30' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Cho phép tạo dù hệ thống phát hiện task tương tự.' })
  @IsOptional()
  @IsBoolean()
  allowDuplicate?: boolean;
}
