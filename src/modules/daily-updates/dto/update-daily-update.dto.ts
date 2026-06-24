import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DailyMood } from '../../../common/enums/daily-mood.enum';

export class UpdateDailyUpdateDto {
  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    description: 'Sprint UUID moi, hoac null de dua bao cao ra khoi sprint.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string | null;

  @ApiPropertyOptional({
    example: 'Da hoan thanh API tao task va API update task.',
    description: 'Noi dung hom qua da lam, toi da 3000 ky tu.',
    minLength: 2,
    maxLength: 3000,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(3000)
  yesterdayWork?: string;

  @ApiPropertyOptional({
    example: 'Lam test case cho Task Module.',
    description: 'Ke hoach hom nay, toi da 3000 ky tu.',
    minLength: 2,
    maxLength: 3000,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(3000)
  todayPlan?: string;

  @ApiPropertyOptional({
    example: 'Khong con blocker.',
    description: 'Kho khan/blocker moi, toi da 3000 ky tu.',
    maxLength: 3000,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  blockers?: string | null;

  @ApiPropertyOptional({
    example: 'Can push code len Git.',
    description: 'Ghi chu moi, toi da 3000 ky tu.',
    maxLength: 3000,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  notes?: string | null;

  @ApiPropertyOptional({
    enum: DailyMood,
    example: DailyMood.Good,
    description: 'Tam trang/trang thai moi.',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(DailyMood)
  mood?: DailyMood | null;
}
