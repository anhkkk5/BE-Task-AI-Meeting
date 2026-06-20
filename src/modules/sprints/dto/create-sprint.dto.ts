import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSprintDto {
  @ApiProperty({
    example: 'Sprint 1 - System analysis',
    description: 'Ten sprint, tu 2 den 150 ky tu.',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Hoan thanh use case va backlog dau tien',
    description: 'Muc tieu sprint, toi da 1000 ky tu.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  goal?: string;

  @ApiProperty({
    example: '2026-06-14',
    description: 'Ngay bat dau theo dinh dang YYYY-MM-DD.',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-06-21',
    description: 'Ngay ket thuc theo dinh dang YYYY-MM-DD.',
  })
  @IsDateString()
  endDate: string;
}
