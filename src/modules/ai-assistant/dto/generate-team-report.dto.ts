import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/**
 * Nguon du lieu nguoi dung cho phep AI dung khi tao bao cao giao ban.
 *
 * Tat mot nguon nghia la khong truy van bang do va prompt cung khong co muc do,
 * chu khong phai chi an tren giao dien.
 */
export class TeamReportDataSourcesDto {
  @ApiPropertyOptional({
    default: true,
    description: 'Task va trang thai task.',
  })
  @IsOptional()
  @IsBoolean()
  tasks?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Cap nhat hang ngay cua thanh vien.',
  })
  @IsOptional()
  @IsBoolean()
  dailyUpdates?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Bien ban cuoc hop gan nhat trong ngay.',
  })
  @IsOptional()
  @IsBoolean()
  meetingTranscripts?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Bao cao giao ban ngay truoc de so sanh tien do.',
  })
  @IsOptional()
  @IsBoolean()
  previousReport?: boolean;
}

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

  @ApiPropertyOptional({
    type: TeamReportDataSourcesDto,
    description: 'Nguon du lieu AI duoc phep su dung.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TeamReportDataSourcesDto)
  dataSources?: TeamReportDataSourcesDto;

  @ApiPropertyOptional({
    example: 'Tap trung vao cong viec bi cham va nguoi can ho tro.',
    description:
      'Yeu cau them cho AI. Chi doi cach trinh bay, khong duoc bo du lieu.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  extraInstruction?: string;
}
