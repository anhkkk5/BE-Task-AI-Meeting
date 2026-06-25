import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GeneratePersonalReportDto {
  @ApiProperty({
    example: '2026-06-20',
    description: 'Ngay can tao bao cao ca nhan, dinh dang YYYY-MM-DD.',
  })
  @IsDateString()
  reportDate: string;

  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Sprint UUID neu muon gioi han du lieu theo sprint.',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;
}
