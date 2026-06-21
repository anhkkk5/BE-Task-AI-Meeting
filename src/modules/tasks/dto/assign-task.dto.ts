import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ValidateIf } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({
    example: '5f12e7a0-c3db-4d4a-b8e9-a6b1fdc87001',
    nullable: true,
    description: 'User UUID cua assignee. Gui null de bo gan task.',
  })
  @ValidateIf((_, value: unknown) => value !== null)
  @IsUUID()
  assigneeId: string | null;
}
