import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MeetingType } from '../../../common/enums/meeting-type.enum';

export class CreateMeetingDto {
  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Sprint UUID neu meeting gan voi sprint.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string | null;

  @ApiProperty({
    example: 'Sprint Planning - Sprint 4',
    description: 'Tieu de meeting, tu 2 den 200 ky tu.',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'Hop lap ke hoach cho Sprint 4',
    description: 'Mo ta meeting, toi da 1000 ky tu.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    enum: MeetingType,
    example: MeetingType.SprintPlanning,
    description: 'Loai meeting.',
  })
  @IsOptional()
  @IsEnum(MeetingType)
  meetingType?: MeetingType;

  @ApiProperty({
    example: '2026-06-20',
    description: 'Ngay hop theo dinh dang YYYY-MM-DD.',
  })
  @IsDateString()
  meetingDate: string;

  @ApiPropertyOptional({
    example: '2026-06-20T08:00:00.000Z',
    description: 'Thoi gian bat dau neu co.',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string | null;

  @ApiPropertyOptional({
    example: '2026-06-20T09:00:00.000Z',
    description: 'Thoi gian ket thuc neu co.',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  endTime?: string | null;

  @ApiPropertyOptional({
    example: [
      '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
      '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87002',
    ],
    description:
      'Danh sach user UUID can them vao meeting. Nguoi tao se tu dong la HOST.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  @Type(() => String)
  participantIds?: string[];
}
