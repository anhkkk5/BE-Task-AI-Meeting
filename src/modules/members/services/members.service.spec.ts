import { BadRequestException, ConflictException } from '@nestjs/common';
import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { MembersService } from './members.service';

describe('MembersService', () => {
  let service: MembersService;
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail'>>;
  let workspaceAccessService: jest.Mocked<
    Pick<
      WorkspaceAccessService,
      'assertWorkspaceActive' | 'assertWorkspaceMember' | 'assertWorkspaceOwner'
    >
  >;
  let workspaceMembersRepository: jest.Mocked<
    Pick<
      WorkspaceMembersRepository,
      | 'countActiveOwners'
      | 'createMember'
      | 'findActiveByWorkspace'
      | 'findByIdAndWorkspace'
      | 'findByWorkspaceAndUser'
      | 'updateMember'
    >
  >;

  const user = {
    id: 'member-user-id',
    email: 'member@example.com',
    fullName: 'Nguyen Van A',
    avatarUrl: null,
    jobTitle: 'Developer',
    status: UserStatus.Active,
  } as User;

  const member = {
    id: 'member-id',
    workspaceId: 'workspace-id',
    userId: user.id,
    user,
    role: WorkspaceRole.Member,
    status: WorkspaceMemberStatus.Active,
    joinedAt: new Date('2026-06-18T00:00:00.000Z'),
  } as WorkspaceMember;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceActive: jest.fn(),
      assertWorkspaceMember: jest.fn(),
      assertWorkspaceOwner: jest.fn(),
    };
    workspaceMembersRepository = {
      countActiveOwners: jest.fn(),
      createMember: jest.fn(),
      findActiveByWorkspace: jest.fn(),
      findByIdAndWorkspace: jest.fn(),
      findByWorkspaceAndUser: jest.fn(),
      updateMember: jest.fn(),
    };
    service = new MembersService(
      usersService as unknown as UsersService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      workspaceMembersRepository as unknown as WorkspaceMembersRepository,
    );
  });

  it('returns active members after membership check', async () => {
    workspaceMembersRepository.findActiveByWorkspace.mockResolvedValue([
      member,
    ]);

    const response = await service.getMembers(
      'current-user-id',
      'workspace-id',
    );

    expect(workspaceAccessService.assertWorkspaceMember).toHaveBeenCalledWith(
      'current-user-id',
      'workspace-id',
    );
    expect(response.data.items).toHaveLength(1);
    expect(response.data.items[0]).toMatchObject({
      memberId: member.id,
      email: user.email,
      role: WorkspaceRole.Member,
    });
  });

  it('adds existing registered user by normalized email', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    workspaceMembersRepository.findByWorkspaceAndUser.mockResolvedValue(null);
    workspaceMembersRepository.createMember.mockResolvedValue(member);

    const response = await service.addMember('owner-id', 'workspace-id', {
      email: ' MEMBER@EXAMPLE.COM ',
      role: WorkspaceRole.Member,
    });

    expect(workspaceAccessService.assertWorkspaceOwner).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
    );
    expect(usersService.findByEmail).toHaveBeenCalledWith('member@example.com');
    expect(workspaceMembersRepository.createMember).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userId: user.id,
      role: WorkspaceRole.Member,
    });
    expect(response.data.member.email).toBe(user.email);
  });

  it('rejects adding active member twice', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    workspaceMembersRepository.findByWorkspaceAndUser.mockResolvedValue(member);

    await expect(
      service.addMember('owner-id', 'workspace-id', {
        email: user.email,
        role: WorkspaceRole.Viewer,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(workspaceMembersRepository.createMember).not.toHaveBeenCalled();
  });

  it('looks up registered user before adding member', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    workspaceMembersRepository.findByWorkspaceAndUser.mockResolvedValue(null);

    const response = await service.lookupMember(
      'owner-id',
      'workspace-id',
      ' MEMBER@EXAMPLE.COM ',
    );

    expect(workspaceAccessService.assertWorkspaceOwner).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
    );
    expect(workspaceAccessService.assertWorkspaceActive).toHaveBeenCalledWith(
      'workspace-id',
    );
    expect(usersService.findByEmail).toHaveBeenCalledWith('member@example.com');
    expect(response.data).toMatchObject({
      canAdd: true,
      reason: null,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: UserStatus.Active,
      },
      existingMember: null,
    });
  });

  it('marks lookup as not addable when user is already active member', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    workspaceMembersRepository.findByWorkspaceAndUser.mockResolvedValue(member);

    const response = await service.lookupMember(
      'owner-id',
      'workspace-id',
      user.email,
    );

    expect(response.data.canAdd).toBe(false);
    expect(response.data.reason).toBe('ALREADY_ACTIVE_MEMBER');
    expect(response.data.existingMember).toMatchObject({
      memberId: member.id,
      role: WorkspaceRole.Member,
      status: WorkspaceMemberStatus.Active,
    });
  });

  it('returns empty lookup result when email is not registered', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    const response = await service.lookupMember(
      'owner-id',
      'workspace-id',
      'missing@example.com',
    );

    expect(response.data).toEqual({
      user: null,
      existingMember: null,
      canAdd: false,
      reason: 'USER_NOT_FOUND',
    });
  });

  it('reactivates removed member without creating duplicate row', async () => {
    const removedMember = {
      ...member,
      status: WorkspaceMemberStatus.Removed,
    } as WorkspaceMember;

    usersService.findByEmail.mockResolvedValue(user);
    workspaceMembersRepository.findByWorkspaceAndUser.mockResolvedValue(
      removedMember,
    );
    workspaceMembersRepository.updateMember.mockResolvedValue({
      ...removedMember,
      status: WorkspaceMemberStatus.Active,
      role: WorkspaceRole.Viewer,
    });

    const response = await service.addMember('owner-id', 'workspace-id', {
      email: user.email,
      role: WorkspaceRole.Viewer,
    });

    expect(workspaceMembersRepository.updateMember).toHaveBeenCalledWith(
      removedMember,
      expect.objectContaining({
        role: WorkspaceRole.Viewer,
        status: WorkspaceMemberStatus.Active,
      }),
    );
    expect(response.data.member.status).toBe(WorkspaceMemberStatus.Active);
  });

  it('changes member role after owner and active workspace checks', async () => {
    workspaceMembersRepository.findByIdAndWorkspace.mockResolvedValue(member);
    workspaceMembersRepository.updateMember.mockResolvedValue({
      ...member,
      role: WorkspaceRole.ProjectManager,
    });

    const response = await service.changeMemberRole(
      'owner-id',
      'workspace-id',
      member.id,
      {
        role: WorkspaceRole.ProjectManager,
      },
    );

    expect(workspaceAccessService.assertWorkspaceOwner).toHaveBeenCalled();
    expect(workspaceAccessService.assertWorkspaceActive).toHaveBeenCalled();
    expect(response.data.member.role).toBe(WorkspaceRole.ProjectManager);
  });

  it('does not demote the last owner', async () => {
    workspaceMembersRepository.findByIdAndWorkspace.mockResolvedValue({
      ...member,
      role: WorkspaceRole.Owner,
    });
    workspaceMembersRepository.countActiveOwners.mockResolvedValue(1);

    await expect(
      service.changeMemberRole('owner-id', 'workspace-id', member.id, {
        role: WorkspaceRole.Member,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(workspaceMembersRepository.updateMember).not.toHaveBeenCalled();
  });

  it('soft removes member by setting status removed', async () => {
    workspaceMembersRepository.findByIdAndWorkspace.mockResolvedValue(member);
    workspaceMembersRepository.updateMember.mockResolvedValue({
      ...member,
      status: WorkspaceMemberStatus.Removed,
    });

    const response = await service.removeMember(
      'owner-id',
      'workspace-id',
      member.id,
    );

    expect(workspaceMembersRepository.updateMember).toHaveBeenCalledWith(
      member,
      {
        status: WorkspaceMemberStatus.Removed,
      },
    );
    expect(response.data).toBeNull();
  });

  it('returns current user role in workspace', async () => {
    workspaceAccessService.assertWorkspaceMember.mockResolvedValue(member);

    const response = await service.getMyRole(user.id, 'workspace-id');

    expect(response.data).toMatchObject({
      workspaceId: 'workspace-id',
      userId: user.id,
      role: WorkspaceRole.Member,
      status: WorkspaceMemberStatus.Active,
    });
  });
});
