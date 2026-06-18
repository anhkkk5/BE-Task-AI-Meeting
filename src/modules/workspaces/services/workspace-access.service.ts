import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceStatus } from '../../../common/enums/workspace-status.enum';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';

@Injectable()
export class WorkspaceAccessService {
  constructor(
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
  ) {}

  async getUserWorkspaceRole(userId: string, workspaceId: string) {
    const member =
      await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(
        workspaceId,
        userId,
      );

    return member?.role ?? null;
  }

  async isWorkspaceMember(userId: string, workspaceId: string) {
    const role = await this.getUserWorkspaceRole(userId, workspaceId);
    return Boolean(role);
  }

  async assertWorkspaceMember(userId: string, workspaceId: string) {
    const member =
      await this.workspaceMembersRepository.findActiveByWorkspaceAndUser(
        workspaceId,
        userId,
      );

    if (!member) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return member;
  }

  async assertWorkspaceOwner(userId: string, workspaceId: string) {
    const member = await this.assertWorkspaceMember(userId, workspaceId);

    if (member.role !== WorkspaceRole.Owner) {
      throw new ForbiddenException(
        'Only workspace owner can perform this action',
      );
    }

    return member;
  }

  async assertWorkspaceActive(workspaceId: string) {
    const workspace = await this.workspacesRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.status !== WorkspaceStatus.Active) {
      throw new ForbiddenException('Workspace is archived');
    }

    return workspace;
  }
}
