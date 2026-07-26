import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Cac truong nguoi duyet duoc sua tay trong ban nhap bao cao giao ban.
 *
 * Chi mo cac muc mang tinh dien giai. Khong cho sua `metrics` vi so lieu phai
 * bam theo du lieu that trong he thong, sua tay thi bao cao mat gia tri.
 */
export class UpdateTeamReportDto {
  @ApiPropertyOptional({ description: 'Tom tat tong quan bao cao.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @ApiPropertyOptional({ description: 'Dien giai tien do cua nhom.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  teamProgress?: string;

  @ApiPropertyOptional({ type: [String], description: 'Viec da hoan thanh.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  completedWork?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Trong tam hom nay.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  todayFocus?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Tro ngai can xu ly.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  blockers?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Rui ro cua du an.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  risks?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Ke hoach tiep theo.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  recommendations?: string[];
}
