import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, NotEquals } from 'class-validator';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';

export class AddMemberDto {
  @ApiProperty({
    example: 'member@example.com',
    description: 'Email cua user da dang ky trong he thong.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: WorkspaceRole,
    example: WorkspaceRole.Member,
    description: 'Role gan cho member moi. Khong duoc them OWNER bang API nay.',
  })
  @IsEnum(WorkspaceRole)
  @NotEquals(WorkspaceRole.Owner)
  role: Exclude<WorkspaceRole, WorkspaceRole.Owner>;
}
