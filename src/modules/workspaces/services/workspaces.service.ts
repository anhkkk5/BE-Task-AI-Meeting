import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createSlug } from '../../../common/utils/slug.util';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { GetWorkspacesQueryDto } from '../dto/get-workspaces-query.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
import { WorkspaceAccessService } from './workspace-access.service';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
    const name = dto.name.trim();
    const description = dto.description?.trim() || null;
    const slug = await this.createUniqueSlug(name);

    const workspace = await this.dataSource.transaction(async (manager) => {
      const createdWorkspace = await this.workspacesRepository.create(
        {
          name,
          slug,
          description,
          ownerId: userId,
        },
        manager,
      );

      await this.workspaceMembersRepository.createOwnerMember(
        {
          workspaceId: createdWorkspace.id,
          userId,
        },
        manager,
      );

      return createdWorkspace;
    });

    return {
      success: true,
      message: 'Create workspace successfully',
      data: {
        workspace: this.toWorkspaceResponse(workspace),
      },
    };
  }

  async getMyWorkspaces(userId: string, query: GetWorkspacesQueryDto) {
    const members = await this.workspaceMembersRepository.findActiveByUser(
      userId,
      query.status,
    );

    return {
      success: true,
      message: 'Get workspaces successfully',
      data: {
        items: members.map((member) => ({
          ...this.toWorkspaceResponse(member.workspace),
          role: member.role,
        })),
      },
    };
  }

  async getWorkspaceDetail(userId: string, workspaceId: string) {
    const member = await this.workspaceAccessService.assertWorkspaceMember(
      userId,
      workspaceId,
    );
    const workspace = await this.findWorkspaceOrFail(workspaceId);

    return {
      success: true,
      message: 'Get workspace detail successfully',
      data: {
        workspace: {
          ...this.toWorkspaceResponse(workspace),
          myRole: member.role,
          updatedAt: workspace.updatedAt,
        },
      },
    };
  }

  async updateWorkspace(
    userId: string,
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceOwner(userId, workspaceId);
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);

    const workspace = await this.workspacesRepository.update(workspaceId, {
      name: dto.name?.trim(),
      description:
        dto.description === undefined
          ? undefined
          : dto.description.trim() || null,
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return {
      success: true,
      message: 'Update workspace successfully',
      data: {
        workspace: this.toWorkspaceResponse(workspace),
      },
    };
  }

  async archiveWorkspace(userId: string, workspaceId: string) {
    await this.workspaceAccessService.assertWorkspaceOwner(userId, workspaceId);
    await this.findWorkspaceOrFail(workspaceId);
    await this.workspacesRepository.archive(workspaceId);

    return {
      success: true,
      message: 'Archive workspace successfully',
      data: null,
    };
  }

  private async createUniqueSlug(name: string) {
    const baseSlug = createSlug(name) || 'workspace';
    let slug = baseSlug;
    let suffix = 1;

    while (await this.workspacesRepository.findBySlug(slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return slug;
  }

  private async findWorkspaceOrFail(workspaceId: string) {
    const workspace = await this.workspacesRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  private toWorkspaceResponse(workspace: Workspace) {
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      ownerId: workspace.ownerId,
      plan: workspace.plan,
      status: workspace.status,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
