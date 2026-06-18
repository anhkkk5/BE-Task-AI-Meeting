import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Agile/Scrum AI Project Management',
    description: 'Ten project, tu 2 den 150 ky tu.',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'AGILEAI',
    description: 'Ma project viet hoa, khong dau, khong khoang trang.',
    minLength: 2,
    maxLength: 20,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Z0-9_]+$/, {
    message:
      'keyCode must contain only uppercase letters, numbers, and underscore',
  })
  keyCode: string;

  @ApiPropertyOptional({
    example: 'Du an quan ly Agile/Scrum tich hop tro ly AI',
    description: 'Mo ta project, toi da 1000 ky tu.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: '2026-06-14',
    description: 'Ngay bat dau theo dinh dang YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-30',
    description: 'Ngay ket thuc theo dinh dang YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
