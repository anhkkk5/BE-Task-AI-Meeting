import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateParticipantAttendanceDto {
  @ApiProperty({
    example: true,
    description: 'Trang thai co tham gia meeting hay khong.',
  })
  @IsBoolean()
  attended: boolean;
}
