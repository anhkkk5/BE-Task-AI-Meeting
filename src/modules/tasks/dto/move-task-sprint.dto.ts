import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ValidateIf } from 'class-validator';

export class MoveTaskSprintDto {
  @ApiProperty({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    nullable: true,
    description: 'Sprint UUID moi. Gui null de dua task ve backlog.',
  })
  @ValidateIf((_, value: unknown) => value !== null)
  @IsUUID()
  sprintId: string | null;
}
