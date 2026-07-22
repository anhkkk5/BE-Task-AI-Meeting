import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { AiFocusArea } from '../enums/ai-focus-area.enum';
import { AiResponseStyle } from '../enums/ai-response-style.enum';
import { AiTone } from '../enums/ai-tone.enum';

export class UpdateAiUserPreferencesDto {
  @ApiPropertyOptional({
    enum: AiResponseStyle,
    example: AiResponseStyle.Balanced,
  })
  @IsOptional()
  @IsEnum(AiResponseStyle)
  responseStyle?: AiResponseStyle;

  @ApiPropertyOptional({ enum: AiTone, example: AiTone.Professional })
  @IsOptional()
  @IsEnum(AiTone)
  tone?: AiTone;

  @ApiPropertyOptional({
    enum: AiFocusArea,
    isArray: true,
    example: [
      AiFocusArea.Progress,
      AiFocusArea.Blockers,
      AiFocusArea.ActionItems,
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(AiFocusArea, { each: true })
  focusAreas?: AiFocusArea[];
}
