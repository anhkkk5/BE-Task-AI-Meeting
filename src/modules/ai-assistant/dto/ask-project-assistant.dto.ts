import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AskProjectAssistantDto {
  @ApiProperty({
    example: 'Sprint hiện tại có những rủi ro nào cần xử lý trước?',
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  question: string;

  @ApiPropertyOptional({
    description:
      'Giới hạn câu hỏi trong một Sprint. Bỏ trống để hỏi toàn dự án.',
    example: '2b34712e-7eb4-4baa-bf20-f7bb61d80c5e',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;
}
