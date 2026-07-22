import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RejectHandoverDto {
  @ApiProperty({
    description: 'Lý do không thể nhận bàn giao.',
    example: 'Tôi không thuộc nhóm phụ trách chức năng này.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  reason: string;
}
