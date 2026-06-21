import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TaskPriority } from '../../../common/enums/task-priority.enum';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Code API tao task',
    description: 'Tieu de task, tu 2 den 200 ky tu.',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'Xay dung API tao task trong project',
    description: 'Mo ta chi tiet task, toi da 2000 ky tu.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Sprint UUID neu task duoc dua truc tiep vao sprint.',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiPropertyOptional({
    example: '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
    description: 'User UUID cua assignee ACTIVE trong workspace.',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.High,
    description: 'Do uu tien cua task.',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2026-06-25',
    description: 'Deadline theo dinh dang YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    example: 6,
    minimum: 0.1,
    description: 'So gio uoc luong, phai lon hon 0.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  estimatedHours?: number;

  @ApiPropertyOptional({
    example: 3,
    minimum: 1,
    description: 'Story points, phai la so nguyen duong.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  storyPoints?: number;
}
