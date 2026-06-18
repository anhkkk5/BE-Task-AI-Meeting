import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceStatus } from '../../../common/enums/workspace-status.enum';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
import { WorkspaceAccessService } from './workspace-access.service';

describe('WorkspaceAccessService', () => {
  let service: WorkspaceAccessService;
  let workspacesRepository: jest.Mocked<Pick<WorkspacesRepository, 'findById'>>;
  let workspaceMembersRepository: jest.Mocked<
    Pick<WorkspaceMembersRepository, 'findActiveByWorkspaceAndUser'>
  >;

  beforeEach(() => {
    workspacesRepository = {
      findById: jest.fn(),
    };
    workspaceMembersRepository = {
      findActiveByWorkspaceAndUser: jest.fn(),
    };
    service = new WorkspaceAccessService(
      workspacesRepository as unknown as WorkspacesRepository,
      workspaceMembersRepository as unknown as WorkspaceMembersRepository,
    );
  });

  it('returns user role in workspace', async () => {
    workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue({
      role: WorkspaceRole.Owner,
    } as never);

    await expect(
      service.getUserWorkspaceRole('user-id', 'workspace-id'),
    ).resolves.toBe(WorkspaceRole.Owner);
  });

  it('throws when user is not workspace member', async () => {
    workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue(
      null,
    );

    await expect(
      service.assertWorkspaceMember('user-id', 'workspace-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when user is not owner', async () => {
    workspaceMembersRepository.findActiveByWorkspaceAndUser.mockResolvedValue({
      role: WorkspaceRole.Member,
    } as never);

    await expect(
      service.assertWorkspaceOwner('user-id', 'workspace-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when workspace is archived', async () => {
    workspacesRepository.findById.mockResolvedValue({
      status: WorkspaceStatus.Archived,
    } as never);

    await expect(
      service.assertWorkspaceActive('workspace-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when workspace is missing', async () => {
    workspacesRepository.findById.mockResolvedValue(null);

    await expect(
      service.assertWorkspaceActive('workspace-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
