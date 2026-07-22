import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AppendLiveTranscriptSegmentDto {
  @ApiProperty({
    example: 'Em da import backlog tu Excel va can anh review sprint mapping.',
    description: 'Noi dung vua duoc nhan dien tu mic cua user hien tai.',
    minLength: 1,
    maxLength: 3000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  text: string;

  @ApiPropertyOptional({
    example: '2026-07-13T09:00:12.000Z',
    description:
      'Thoi diem bat dau doan noi. Neu khong gui thi backend tu lay now.',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({
    example: '2026-07-13T09:00:16.000Z',
    description: 'Thoi diem ket thuc doan noi.',
  })
  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @ApiPropertyOptional({
    example: 0.92,
    minimum: 0,
    maximum: 1,
    description: 'Do tin cay cua speech-to-text neu provider co tra ve.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @ApiPropertyOptional({
    example: 'browser-speech',
    maxLength: 50,
    description:
      'Nguon tao transcript: browser-speech, deepgram, assemblyai...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;
}
