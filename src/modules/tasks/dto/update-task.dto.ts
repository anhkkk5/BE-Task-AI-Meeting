import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TaskPriority } from '../../../common/enums/task-priority.enum';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Code API tao va cap nhat task',
    description: 'Tieu de task moi, tu 2 den 200 ky tu.',
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'Cap nhat mo ta task',
    description: 'Mo ta chi tiet task, toi da 2000 ky tu.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.Urgent,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2026-06-28',
    description: 'Deadline theo dinh dang YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 8, minimum: 0.1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  estimatedHours?: number;

  @ApiPropertyOptional({ example: 5, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  storyPoints?: number;
}
