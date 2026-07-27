import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

/**
 * Dau vao cho "AI soan bao cao cua toi".
 *
 * Chi can biet soan cho ngay nao; nguoi soan luon la nguoi goi API nen khong co
 * truong userId de tranh soan ho nguoi khac.
 */
export class DraftDailyUpdateDto {
  @ApiProperty({
    example: '2026-06-20',
    description: 'Ngay can soan bao cao, dinh dang YYYY-MM-DD.',
  })
  @IsDateString()
  updateDate: string;

  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Sprint UUID neu muon gioi han du lieu trong mot sprint.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string | null;
}
