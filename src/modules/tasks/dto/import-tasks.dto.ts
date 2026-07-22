import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { TaskStatus } from '../../../common/enums/task-status.enum';

export class TaskImportItemDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(2)
  rowNumber?: number;

  @ApiProperty({ example: 'Thiết kế màn hình backlog giống Jira' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'Làm danh sách sprint, backlog và thao tác kéo thả task.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({ example: 'sprint-uuid' })
  @IsOptional()
  @IsUUID()
  sprintId?: string | null;

  @ApiPropertyOptional({ example: 'Sprint 1 - Setup' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sprintName?: string | null;

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.Todo,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;

  @ApiPropertyOptional({ example: 'member@example.com' })
  @IsOptional()
  @IsEmail()
  assigneeEmail?: string | null;

  @ApiPropertyOptional({ example: '2026-07-20' })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedHours?: number | null;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  storyPoints?: number | null;
}

export class CommitTaskImportDto {
  @ApiProperty({
    type: [TaskImportItemDto],
    description:
      'Danh sách task đã preview hợp lệ. Tối đa 200 dòng cho mỗi lần import.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => TaskImportItemDto)
  items: TaskImportItemDto[];
}
