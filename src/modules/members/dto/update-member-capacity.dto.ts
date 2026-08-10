import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateMemberCapacityDto {
  @Type(() => Number) @IsNumber() @Min(0) @Max(24) dailyCapacityHours: number;
  @IsOptional() @IsArray() @IsDateString({}, { each: true }) unavailableDates?: string[];
}
