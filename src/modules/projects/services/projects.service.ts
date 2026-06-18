import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project } from '../entities/project.entity';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectAccessService } from './project-access.service';

const projectWriteRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly projectAccessService: ProjectAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async createProject(
    currentUserId: string,
    workspaceId: string,
    dto: CreateProjectDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    this.assertDateRange(dto.startDate, dto.endDate);

    const keyCode = dto.keyCode.trim().toUpperCase();
    const existingProject =
      await this.projectsRepository.findByWorkspaceAndKeyCode(
        workspaceId,
        keyCode,
      );

    if (existingProject) {
      throw new ConflictException(
        'Project key code already exists in this workspace',
      );
    }

    const project = await this.projectsRepository.create({
      workspaceId,
      name: dto.name.trim(),
      keyCode,
      description: dto.description?.trim() || null,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      createdBy: currentUserId,
    });

    return {
      success: true,
      message: 'Create project successfully',
      data: {
        project: this.toProjectResponse(project),
      },
    };
  }

  async getProjects(
    currentUserId: string,
    workspaceId: string,
    query: GetProjectsQueryDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const result = await this.projectsRepository.findByWorkspace(
      workspaceId,
      query,
    );

    return {
      success: true,
      message: 'Get projects successfully',
      data: {
        items: result.items.map((project) => this.toProjectResponse(project)),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      },
    };
  }

  async getProjectDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );

    return {
      success: true,
      message: 'Get project detail successfully',
      data: {
        project: this.toProjectResponse(project),
      },
    };
  }

  async updateProject(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    this.assertDateRange(dto.startDate, dto.endDate);
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );

    const updatedProject = await this.projectsRepository.update(project, {
      name: dto.name?.trim() ?? project.name,
      description:
        dto.description === undefined
          ? project.description
          : dto.description.trim() || null,
      startDate: dto.startDate ?? project.startDate,
      endDate: dto.endDate ?? project.endDate,
    });

    return {
      success: true,
      message: 'Update project successfully',
      data: {
        project: this.toProjectResponse(updatedProject),
      },
    };
  }

  async archiveProject(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.projectsRepository.archive(project);

    return {
      success: true,
      message: 'Archive project successfully',
      data: null,
    };
  }

  async completeProject(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.projectsRepository.complete(project);

    return {
      success: true,
      message: 'Complete project successfully',
      data: null,
    };
  }

  getProjectWriteRoles() {
    return projectWriteRoles;
  }

  private assertDateRange(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      return;
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      throw new BadRequestException(
        'endDate must not be earlier than startDate',
      );
    }
  }

  private toProjectResponse(project: Project) {
    return {
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      keyCode: project.keyCode,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
