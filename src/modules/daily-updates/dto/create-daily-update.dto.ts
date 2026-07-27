import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DailyMood } from '../../../common/enums/daily-mood.enum';

export class CreateDailyUpdateDto {
  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Sprint UUID neu bao cao gan voi mot sprint.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string | null;

  @ApiProperty({
    example: '2026-06-20',
    description: 'Ngay bao cao theo dinh dang YYYY-MM-DD.',
  })
  @IsDateString()
  updateDate: string;

  @ApiProperty({
    example: 'Hoan thanh API tao task va API xem danh sach task.',
    description: 'Noi dung hom qua da lam, toi da 3000 ky tu.',
    minLength: 2,
    maxLength: 3000,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(3000)
  yesterdayWork: string;

  @ApiProperty({
    example: 'Lam API cap nhat trang thai task va API gan task.',
    description: 'Ke hoach hom nay, toi da 3000 ky tu.',
    minLength: 2,
    maxLength: 3000,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(3000)
  todayPlan: string;

  @ApiPropertyOptional({
    example: 'Chua thong nhat rule MEMBER duoc doi trang thai task.',
    description: 'Kho khan/blocker, toi da 3000 ky tu.',
    maxLength: 3000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  blockers?: string;

  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01002',
    description:
      'UUID nguoi ma minh can ho tro trong ngay. Phai la thanh vien ACTIVE cua workspace.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  needHelpFromId?: string | null;

  @ApiPropertyOptional({
    example: 'Can review lai phan phan quyen task.',
    description: 'Ghi chu them, toi da 3000 ky tu.',
    maxLength: 3000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  notes?: string;

  @ApiPropertyOptional({
    enum: DailyMood,
    example: DailyMood.Normal,
    description: 'Tam trang/trang thai lam viec trong ngay.',
  })
  @IsOptional()
  @IsEnum(DailyMood)
  mood?: DailyMood;
}
