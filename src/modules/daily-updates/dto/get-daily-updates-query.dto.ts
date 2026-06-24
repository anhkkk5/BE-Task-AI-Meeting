import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class GetDailyUpdatesQueryDto {
  @ApiPropertyOptional({
    example: '2026-06-20',
    description: 'Loc dung mot ngay bao cao.',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Loc tu ngay.',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-30',
    description: 'Loc den ngay.',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Loc theo sprint UUID.',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiPropertyOptional({
    example: '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
    description: 'Loc theo user UUID, chi dung cho team daily updates.',
  })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
