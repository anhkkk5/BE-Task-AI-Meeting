import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSprintDto {
  @ApiPropertyOptional({
    example: 'Sprint 1 - Analysis and design',
    description: 'Ten sprint moi, tu 2 den 150 ky tu.',
    minLength: 2,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'Hoan thanh use case, backlog va phan quyen',
    description: 'Muc tieu sprint, toi da 1000 ky tu.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  goal?: string;

  @ApiPropertyOptional({
    example: '2026-06-15',
    description: 'Ngay bat dau theo dinh dang YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-22',
    description: 'Ngay ket thuc theo dinh dang YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
