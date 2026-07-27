import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/**
 * Dau vao cho "AI soan noi dung ban giao".
 *
 * `receiverId` khong bat buoc: nguoi dung co the soan nhap truoc khi chon nguoi
 * nhan. Neu co thi AI viet phan huong dan sat voi nguoi nhan cu the hon.
 */
export class DraftHandoverDto {
  @ApiProperty({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01003',
    description: 'Task UUID can ban giao. Phai la task dang gan cho nguoi goi.',
  })
  @IsUUID()
  taskId: string;

  @ApiPropertyOptional({
    example: '9d38e4c2-0d77-4d6c-9127-b06b66d01002',
    description: 'UUID nguoi se nhan ban giao, neu da chon.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  receiverId?: string | null;
}
