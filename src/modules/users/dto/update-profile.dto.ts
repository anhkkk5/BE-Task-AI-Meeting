import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Ho ten hien thi moi.',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
    description: 'URL anh dai dien. Co the la URL Cloudinary.',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: '0900000000',
    description: 'So dien thoai lien he.',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 'Backend Developer',
    description: 'Chuc danh hoac vai tro ca nhan.',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;
}
