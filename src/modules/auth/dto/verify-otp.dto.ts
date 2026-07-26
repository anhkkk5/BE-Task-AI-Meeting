import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'member@example.com',
    description: 'Email da dung de dang ky va dang cho xac thuc.',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Ma OTP 6 chu so duoc gui vao email.',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'OTP phai gom dung 6 chu so' })
  otp: string;
}
