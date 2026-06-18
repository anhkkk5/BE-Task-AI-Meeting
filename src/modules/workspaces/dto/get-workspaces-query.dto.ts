import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { WorkspaceStatus } from '../../../common/enums/workspace-status.enum';

export class GetWorkspacesQueryDto {
  @ApiPropertyOptional({
    enum: WorkspaceStatus,
    example: WorkspaceStatus.Active,
    description: 'Loc workspace theo status.',
  })
  @IsOptional()
  @IsEnum(WorkspaceStatus)
  status?: WorkspaceStatus;
}
