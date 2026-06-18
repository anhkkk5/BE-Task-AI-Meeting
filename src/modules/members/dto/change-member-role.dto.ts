import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, NotEquals } from 'class-validator';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';

export class ChangeMemberRoleDto {
  @ApiProperty({
    enum: WorkspaceRole,
    example: WorkspaceRole.ProjectManager,
    description: 'Role moi cua member. Khong duoc doi sang OWNER bang API nay.',
  })
  @IsEnum(WorkspaceRole)
  @NotEquals(WorkspaceRole.Owner)
  role: Exclude<WorkspaceRole, WorkspaceRole.Owner>;
}
