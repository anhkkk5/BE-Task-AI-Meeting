import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { UsersService } from '../../users/services/users.service';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AddMemberDto } from '../dto/add-member.dto';
import { ChangeMemberRoleDto } from '../dto/change-member-role.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
  ) {}

  async getMembers(currentUserId: string, workspaceId: string) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const members =
      await this.workspaceMembersRepository.findActiveByWorkspace(workspaceId);

    return {
      success: true,
      message: 'Get workspace members successfully',
      data: {
        items: members.map((member) => this.toMemberResponse(member)),
      },
    };
  }

  async addMember(
    currentUserId: string,
    workspaceId: string,
    dto: AddMemberDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceOwner(
      currentUserId,
      workspaceId,
    );
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);

    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
    );

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const existingMember =
      await this.workspaceMembersRepository.findByWorkspaceAndUser(
        workspaceId,
        user.id,
      );

    if (existingMember?.status === WorkspaceMemberStatus.Active) {
      throw new ConflictException('User is already a member of this workspace');
    }

    const member = existingMember
      ? await this.workspaceMembersRepository.updateMember(existingMember, {
          role: dto.role,
          status: WorkspaceMemberStatus.Active,
          joinedAt: new Date(),
        })
      : await this.workspaceMembersRepository.createMember({
          workspaceId,
          userId: user.id,
          role: dto.role,
        });

    member.user = user;

    return {
      success: true,
      message: 'Add member successfully',
      data: {
        member: this.toMemberResponse(member),
      },
    };
  }

  async changeMemberRole(
    currentUserId: string,
    workspaceId: string,
    memberId: string,
    dto: ChangeMemberRoleDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceOwner(
      currentUserId,
      workspaceId,
    );
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    const member = await this.findMemberOrFail(workspaceId, memberId);

    await this.assertNotLastOwner(
      member,
      'Cannot change role of the last owner',
    );

    const updatedMember = await this.workspaceMembersRepository.updateMember(
      member,
      {
        role: dto.role,
      },
    );

    return {
      success: true,
      message: 'Change member role successfully',
      data: {
        member: this.toMemberResponse(updatedMember),
      },
    };
  }

  async removeMember(
    currentUserId: string,
    workspaceId: string,
    memberId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceOwner(
      currentUserId,
      workspaceId,
    );
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    const member = await this.findMemberOrFail(workspaceId, memberId);

    await this.assertNotLastOwner(
      member,
      'Cannot remove the last owner of workspace',
    );
    await this.workspaceMembersRepository.updateMember(member, {
      status: WorkspaceMemberStatus.Removed,
    });

    return {
      success: true,
      message: 'Remove member successfully',
      data: null,
    };
  }

  async getMyRole(currentUserId: string, workspaceId: string) {
    const member = await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );

    return {
      success: true,
      message: 'Get my workspace role successfully',
      data: {
        workspaceId,
        userId: currentUserId,
        role: member.role,
        status: member.status,
      },
    };
  }

  private async findMemberOrFail(workspaceId: string, memberId: string) {
    const member = await this.workspaceMembersRepository.findByIdAndWorkspace(
      memberId,
      workspaceId,
    );

    if (!member || member.status !== WorkspaceMemberStatus.Active) {
      throw new NotFoundException('Workspace member not found');
    }

    return member;
  }

  private async assertNotLastOwner(member: WorkspaceMember, message: string) {
    if (member.role !== WorkspaceRole.Owner) {
      return;
    }

    const ownerCount = await this.workspaceMembersRepository.countActiveOwners(
      member.workspaceId,
    );

    if (ownerCount <= 1) {
      throw new BadRequestException(message);
    }
  }

  private toMemberResponse(member: WorkspaceMember) {
    return {
      memberId: member.id,
      userId: member.userId,
      fullName: member.user?.fullName ?? null,
      email: member.user?.email ?? null,
      avatarUrl: member.user?.avatarUrl ?? null,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
    };
  }
}
