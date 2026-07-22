import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class GeneratePersonalizedMeetingSummaryDto {
  @ApiPropertyOptional({
    example: false,
    default: false,
    description:
      'true neu muon tao lai personalized summary moi thay vi dung ban moi nhat da co.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  forceRegenerate?: boolean = false;
}
