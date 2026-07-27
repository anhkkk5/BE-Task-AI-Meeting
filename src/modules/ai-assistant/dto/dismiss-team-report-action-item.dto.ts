import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DismissTeamReportActionItemDto {
  @ApiPropertyOptional({
    description:
      'Ly do bo qua. Nen ghi de buoi giao ban sau doc lai con hieu vi sao.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
