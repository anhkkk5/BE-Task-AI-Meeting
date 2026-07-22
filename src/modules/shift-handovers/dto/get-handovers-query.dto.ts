import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { HandoverStatus } from '../../../common/enums/handover-status.enum';

export class GetHandoversQueryDto {
  @ApiPropertyOptional({ enum: HandoverStatus })
  @IsOptional()
  @IsEnum(HandoverStatus)
  status?: HandoverStatus;

  @ApiPropertyOptional({ example: '775409e6-5714-4cef-a95f-fbacb5da3353' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ example: '6bc6e94e-468a-4d11-883e-e34817ad3f77' })
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
