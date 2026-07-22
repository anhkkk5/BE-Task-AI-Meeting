import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateHandoverDto {
  @ApiProperty({
    description: 'Task đang được người giao phụ trách.',
    example: '2f7b08fd-82f8-4bee-8c5f-8fb9fc796463',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    description: 'Thành viên sẽ tiếp nhận task.',
    example: '775409e6-5714-4cef-a95f-fbacb5da3353',
  })
  @IsUUID()
  receiverId: string;

  @ApiProperty({
    description: 'Những phần đã hoàn thành trên task.',
    example: 'Đã hoàn thành API đăng nhập và kiểm thử unit.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  completedWork: string;

  @ApiProperty({
    description: 'Những phần người nhận cần tiếp tục thực hiện.',
    example: 'Kết nối màn hình đăng nhập với API và kiểm thử trên điện thoại.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  remainingWork: string;

  @ApiPropertyOptional({
    description: 'Khó khăn hoặc vấn đề đang chặn công việc.',
    example: 'Cookie HttpOnly chưa hoạt động khi truy cập qua địa chỉ LAN.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  blockers?: string;

  @ApiPropertyOptional({
    description: 'Hướng xử lý tiếp theo được đề xuất.',
    example: 'Kiểm tra cấu hình CORS và SameSite của refresh token.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  nextSteps?: string;

  @ApiPropertyOptional({
    description: 'Mỗi dòng là một branch, tài liệu hoặc đường dẫn tham khảo.',
    example: 'feat/auth-cookie\nhttps://docs.example.com/auth',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  referenceLinks?: string;

  @ApiPropertyOptional({
    description: 'Hạn tiếp tục xử lý sau khi nhận bàn giao.',
    example: '2026-07-25T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
