import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GenerateTeamReportDto {
  @ApiProperty({
    example: '2026-06-22',
    description: 'Ngay can tao AI team daily report.',
  })
  @IsDateString()
  reportDate: string;

  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Sprint UUID neu muon tong hop theo sprint.',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;
}
