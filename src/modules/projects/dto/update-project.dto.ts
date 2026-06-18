import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Agile/Scrum AI Project Updated',
    description: 'Ten project moi, tu 2 den 150 ky tu.',
    minLength: 2,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'Mo ta moi',
    description: 'Mo ta project, toi da 1000 ky tu.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: '2026-06-15',
    description: 'Ngay bat dau theo dinh dang YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
    description: 'Ngay ket thuc theo dinh dang YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
