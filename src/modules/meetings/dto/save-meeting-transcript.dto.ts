import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class MeetingTranscriptSpeakerDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  speakerName?: string;

  @ApiPropertyOptional({
    example: '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    example: 'Hom nay chung ta hop ve Sprint 4.',
    maxLength: 5000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  text: string;
}

export class SaveMeetingTranscriptDto {
  @ApiProperty({
    example:
      'Nguyen Van A: Hom nay chung ta hop ve Sprint 4.\\nNguyen Van B: Em se lam Meeting Module.',
    description: 'Transcript dang text, toi da 50000 ky tu.',
    minLength: 1,
    maxLength: 50000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  rawTranscript: string;

  @ApiPropertyOptional({
    type: [MeetingTranscriptSpeakerDto],
    description: 'Danh sach phan doan theo speaker neu co.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => MeetingTranscriptSpeakerDto)
  speakers?: MeetingTranscriptSpeakerDto[];
}
