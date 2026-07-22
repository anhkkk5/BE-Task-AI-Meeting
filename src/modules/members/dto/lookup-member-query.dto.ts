import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LookupMemberQueryDto {
  @ApiProperty({
    example: 'member@example.com',
    description: 'Email user can tim truoc khi them vao workspace.',
  })
  @IsEmail()
  email: string;
}
