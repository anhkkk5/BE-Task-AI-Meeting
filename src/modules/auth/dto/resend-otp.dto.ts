import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    example: 'member@example.com',
    description: 'Email dang cho xac thuc, dung de gui lai ma OTP moi.',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  email: string;
}
