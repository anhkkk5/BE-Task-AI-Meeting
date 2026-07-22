import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RequestHandoverChangesDto {
  @ApiProperty({
    example: 'Vui lòng bổ sung tình trạng task đăng nhập.',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason: string;
}
