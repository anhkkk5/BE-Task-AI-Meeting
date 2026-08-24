import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskCommentDto {
  @ApiProperty({
    example: 'Đã xử lý xong API. Nhờ @member@example.com kiểm tra.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;
}

export class UpdateTaskCommentDto extends CreateTaskCommentDto {}
