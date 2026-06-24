import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingType } from '../../../common/enums/meeting-type.enum';

export class GetMeetingsQueryDto {
  @ApiPropertyOptional({
    enum: MeetingStatus,
    example: MeetingStatus.Scheduled,
  })
  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;

  @ApiPropertyOptional({
    enum: MeetingType,
    example: MeetingType.DailyScrum,
  })
  @IsOptional()
  @IsEnum(MeetingType)
  meetingType?: MeetingType;

  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    example: 'sprint',
    description: 'Tim theo title hoac description.',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
