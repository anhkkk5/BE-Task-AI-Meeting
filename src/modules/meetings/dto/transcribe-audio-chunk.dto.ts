import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class TranscribeAudioChunkDto {
  @ApiProperty({
    description:
      'Ma duy nhat cua doan am thanh, dung de chong ghi trung khi retry.',
    example: 'session-uuid-1',
  })
  @IsString()
  @MaxLength(120)
  chunkId: string;

  @ApiPropertyOptional({ example: '2026-07-22T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ example: '2026-07-22T08:00:30.000Z' })
  @IsOptional()
  @IsDateString()
  endedAt?: string;
}
