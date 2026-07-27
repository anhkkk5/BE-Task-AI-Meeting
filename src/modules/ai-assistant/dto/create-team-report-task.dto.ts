import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TeamReportActionItemSource } from '../../../common/enums/team-report-action-item-status.enum';

/**
 * Tao task tu mot muc vuong mac / de xuat trong bao cao giao ban.
 *
 * `source` + `itemIndex` xac dinh muc trong bao cao. Khong nhan noi dung tu
 * client de tranh tao task voi noi dung khac voi bao cao; noi dung duoc doc lai
 * tu bao cao trong service.
 */
export class CreateTeamReportTaskDto {
  @ApiProperty({
    enum: TeamReportActionItemSource,
    description: 'Muc den tu danh sach vuong mac hay de xuat.',
  })
  @IsEnum(TeamReportActionItemSource)
  source: TeamReportActionItemSource;

  @ApiProperty({ example: 0, description: 'Vi tri muc trong danh sach.' })
  @IsInt()
  @Min(0)
  itemIndex: number;

  @ApiPropertyOptional({
    description: 'Tieu de task. Bo trong de dung noi dung trong bao cao.',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'User UUID se duoc gan task.' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Sprint UUID. Bo trong de tao task trong backlog.',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiPropertyOptional({ example: '2026-07-30' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
