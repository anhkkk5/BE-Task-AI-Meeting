import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';

export class GetSprintsQueryDto {
  @ApiPropertyOptional({
    enum: SprintStatus,
    example: SprintStatus.Planned,
  })
  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @ApiPropertyOptional({
    example: 'sprint',
    description: 'Tim theo name hoac goal.',
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
