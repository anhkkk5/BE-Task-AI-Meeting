import { DataSource, EntityManager } from 'typeorm';
import { WorkspacePlan } from '../../../common/enums/workspace-plan.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceStatus } from '../../../common/enums/workspace-status.enum';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
import { WorkspaceAccessService } from './workspace-access.service';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;
  let workspacesRepository: jest.Mocked<
    Pick<
      WorkspacesRepository,
      'archive' | 'create' | 'findById' | 'findBySlug' | 'update'
    >
  >;
  let workspaceMembersRepository: jest.Mocked<
    Pick<WorkspaceMembersRepository, 'createOwnerMember' | 'findActiveByUser'>
  >;
  let workspaceAccessService: jest.Mocked<
    Pick<
      WorkspaceAccessService,
      'assertWorkspaceActive' | 'assertWorkspaceMember' | 'assertWorkspaceOwner'
    >
  >;

  const workspace = {
    id: 'workspace-id',
    name: 'Nhom Agile AI',
    slug: 'nhom-agile-ai',
    description: 'Workspace demo',
    ownerId: 'user-id',
    plan: WorkspacePlan.Free,
    status: WorkspaceStatus.Active,
    createdAt: new Date('2026-06-18T00:00:00.000Z'),
    updatedAt: new Date('2026-06-18T00:00:00.000Z'),
    deletedAt: null,
  } as Workspace;

  beforeEach(() => {
    dataSource = {
      transaction: jest.fn(
        (callback: (manager: EntityManager) => Promise<Workspace>) =>
          callback({} as EntityManager),
      ),
    };
    workspacesRepository = {
      archive: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
    };
    workspaceMembersRepository = {
      createOwnerMember: jest.fn(),
      findActiveByUser: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceActive: jest.fn(),
      assertWorkspaceMember: jest.fn(),
      assertWorkspaceOwner: jest.fn(),
    };
    service = new WorkspacesService(
      dataSource as unknown as DataSource,
      workspacesRepository as unknown as WorkspacesRepository,
      workspaceMembersRepository as unknown as WorkspaceMembersRepository,
      workspaceAccessService as unknown as WorkspaceAccessService,
    );
  });

  it('creates workspace and owner member in transaction', async () => {
    workspacesRepository.findBySlug.mockResolvedValue(null);
    workspacesRepository.create.mockResolvedValue(workspace);

    const response = await service.createWorkspace('user-id', {
      name: ' Nhom Agile AI ',
      description: ' Workspace demo ',
    });

    expect(dataSource.transaction).toHaveBeenCalled();
    expect(workspacesRepository.create).toHaveBeenCalledWith(
      {
        name: 'Nhom Agile AI',
        slug: 'nhom-agile-ai',
        description: 'Workspace demo',
        ownerId: 'user-id',
      },
      expect.any(Object),
    );
    expect(workspaceMembersRepository.createOwnerMember).toHaveBeenCalledWith(
      {
        workspaceId: workspace.id,
        userId: 'user-id',
      },
      expect.any(Object),
    );
    expect(response.data.workspace.slug).toBe('nhom-agile-ai');
  });

  it('adds suffix when slug already exists', async () => {
    workspacesRepository.findBySlug
      .mockResolvedValueOnce(workspace)
      .mockResolvedValueOnce(null);
    workspacesRepository.create.mockResolvedValue({
      ...workspace,
      slug: 'nhom-agile-ai-2',
    });

    const response = await service.createWorkspace('user-id', {
      name: 'Nhom Agile AI',
    });

    expect(response.data.workspace.slug).toBe('nhom-agile-ai-2');
  });

  it('returns workspaces for current user only', async () => {
    workspaceMembersRepository.findActiveByUser.mockResolvedValue([
      {
        role: WorkspaceRole.Owner,
        workspace,
      } as WorkspaceMember,
    ]);

    const response = await service.getMyWorkspaces('user-id', {});

    expect(workspaceMembersRepository.findActiveByUser).toHaveBeenCalledWith(
      'user-id',
      undefined,
    );
    expect(response.data.items).toHaveLength(1);
    expect(response.data.items[0]?.role).toBe(WorkspaceRole.Owner);
  });

  it('returns workspace detail with current user role', async () => {
    workspaceAccessService.assertWorkspaceMember.mockResolvedValue({
      role: WorkspaceRole.Owner,
    } as WorkspaceMember);
    workspacesRepository.findById.mockResolvedValue(workspace);

    const response = await service.getWorkspaceDetail('user-id', workspace.id);

    expect(response.data.workspace.myRole).toBe(WorkspaceRole.Owner);
  });

  it('updates workspace after owner and active checks', async () => {
    workspaceAccessService.assertWorkspaceOwner.mockResolvedValue(
      {} as WorkspaceMember,
    );
    workspaceAccessService.assertWorkspaceActive.mockResolvedValue(workspace);
    workspacesRepository.update.mockResolvedValue({
      ...workspace,
      name: 'Updated',
    });

    const response = await service.updateWorkspace('user-id', workspace.id, {
      name: ' Updated ',
    });

    expect(workspaceAccessService.assertWorkspaceOwner).toHaveBeenCalledWith(
      'user-id',
      workspace.id,
    );
    expect(response.data.workspace.name).toBe('Updated');
  });

  it('archives workspace after owner check', async () => {
    workspaceAccessService.assertWorkspaceOwner.mockResolvedValue(
      {} as WorkspaceMember,
    );
    workspacesRepository.findById.mockResolvedValue(workspace);

    const response = await service.archiveWorkspace('user-id', workspace.id);

    expect(workspacesRepository.archive).toHaveBeenCalledWith(workspace.id);
    expect(response.data).toBeNull();
  });
});
