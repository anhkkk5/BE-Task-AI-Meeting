import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MeetingType } from '../../../common/enums/meeting-type.enum';

export class UpdateMeetingDto {
  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Sprint UUID moi, hoac null de bo lien ket sprint.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string | null;

  @ApiPropertyOptional({
    example: 'Sprint Planning - Sprint 4 Updated',
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'Cap nhat noi dung cuoc hop',
    maxLength: 1000,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({
    enum: MeetingType,
    example: MeetingType.General,
  })
  @IsOptional()
  @IsEnum(MeetingType)
  meetingType?: MeetingType;

  @ApiPropertyOptional({
    example: '2026-06-21',
  })
  @IsOptional()
  @IsDateString()
  meetingDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-21T08:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string | null;

  @ApiPropertyOptional({
    example: '2026-06-21T09:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  endTime?: string | null;
}
