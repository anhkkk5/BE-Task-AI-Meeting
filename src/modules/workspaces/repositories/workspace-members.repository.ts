import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMember } from '../entities/workspace-member.entity';

@Injectable()
export class WorkspaceMembersRepository {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly repository: Repository<WorkspaceMember>,
  ) {}

  createOwnerMember(
    data: { workspaceId: string; userId: string },
    manager?: EntityManager,
  ) {
    const repository = this.getRepository(manager);
    const member = repository.create({
      workspaceId: data.workspaceId,
      userId: data.userId,
      role: WorkspaceRole.Owner,
      status: WorkspaceMemberStatus.Active,
      joinedAt: new Date(),
    });

    return repository.save(member);
  }

  createMember(
    data: { workspaceId: string; userId: string; role: WorkspaceRole },
    manager?: EntityManager,
  ) {
    const repository = this.getRepository(manager);
    const member = repository.create({
      workspaceId: data.workspaceId,
      userId: data.userId,
      role: data.role,
      status: WorkspaceMemberStatus.Active,
      joinedAt: new Date(),
    });

    return repository.save(member);
  }

  findActiveByWorkspaceAndUser(workspaceId: string, userId: string) {
    return this.repository.findOne({
      where: {
        workspaceId,
        userId,
        status: WorkspaceMemberStatus.Active,
      },
    });
  }

  findByIdAndWorkspace(memberId: string, workspaceId: string) {
    return this.repository.findOne({
      where: {
        id: memberId,
        workspaceId,
      },
      relations: {
        user: true,
      },
    });
  }

  findByWorkspaceAndUser(workspaceId: string, userId: string) {
    return this.repository.findOne({
      where: {
        workspaceId,
        userId,
      },
      relations: {
        user: true,
      },
    });
  }

  findActiveByWorkspace(workspaceId: string) {
    return this.repository.find({
      where: {
        workspaceId,
        status: WorkspaceMemberStatus.Active,
      },
      relations: {
        user: true,
      },
      order: {
        joinedAt: 'ASC',
      },
    });
  }

  findActiveByUser(userId: string, status?: string) {
    const query = this.repository
      .createQueryBuilder('member')
      .innerJoinAndSelect('member.workspace', 'workspace')
      .where('member.userId = :userId', { userId })
      .andWhere('member.status = :memberStatus', {
        memberStatus: WorkspaceMemberStatus.Active,
      })
      .andWhere('workspace.deletedAt IS NULL');

    if (status) {
      query.andWhere('workspace.status = :status', { status });
    }

    return query.orderBy('workspace.createdAt', 'DESC').getMany();
  }

  countActiveOwners(workspaceId: string) {
    return this.repository.count({
      where: {
        workspaceId,
        role: WorkspaceRole.Owner,
        status: WorkspaceMemberStatus.Active,
      },
    });
  }

  async updateMember(member: WorkspaceMember, data: Partial<WorkspaceMember>) {
    Object.assign(member, data);
    return this.repository.save(member);
  }

  private getRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(WorkspaceMember) : this.repository;
  }
}
