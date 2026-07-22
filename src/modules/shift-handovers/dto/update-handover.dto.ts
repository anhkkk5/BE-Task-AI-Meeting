import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHandoverDto } from './create-handover.dto';

export class UpdateHandoverDto extends PartialType(
  OmitType(CreateHandoverDto, ['taskId'] as const),
) {}
