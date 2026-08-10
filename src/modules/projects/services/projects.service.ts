import { BadRequestException, Injectable } from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { DEFAULT_WORKFLOW_STATUSES, DEFAULT_WORKFLOW_TRANSITIONS } from '../../../common/workflow/default-workflow';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { Project } from '../entities/project.entity';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectAccessService } from './project-access.service';
import { ProjectKeyCodeService } from './project-key-code.service';

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
    private readonly projectKeyCodeService: ProjectKeyCodeService,
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

    const name = dto.name.trim();
    // Key code sinh tu ten project. Nguoi dung khong nhap nen khong the trung,
    // ham nay tu them so dem khi can.
    const keyCode = await this.projectKeyCodeService.generateUniqueKeyCode(
      workspaceId,
      name,
    );

    const project = await this.projectsRepository.create({
      workspaceId,
      name,
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
    const project =
      await this.projectAccessService.assertProjectDetailInWorkspace(
        projectId,
        workspaceId,
      );

    return {
      success: true,
      message: 'Get project detail successfully',
      data: {
        project: {
          ...this.toProjectResponse(project),
          createdByUser: project.creator
            ? {
                id: project.creator.id,
                fullName: project.creator.fullName,
                email: project.creator.email,
                avatarUrl: project.creator.avatarUrl,
              }
            : null,
        },
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
    this.assertWorkflow(dto.workflowStatuses, dto.workflowTransitions);

    const updatedProject = await this.projectsRepository.update(project, {
      name: dto.name?.trim() ?? project.name,
      description:
        dto.description === undefined
          ? project.description
          : dto.description.trim() || null,
      startDate: dto.startDate ?? project.startDate,
      endDate: dto.endDate ?? project.endDate,
      workflowStatuses: (dto.workflowStatuses as typeof project.workflowStatuses | undefined) ?? project.workflowStatuses,
      workflowTransitions: (dto.workflowTransitions as typeof project.workflowTransitions | undefined) ?? project.workflowTransitions,
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

  private assertWorkflow(statuses?: UpdateProjectDto['workflowStatuses'], transitions?: UpdateProjectDto['workflowTransitions']) {
    if (!statuses && !transitions) return;
    const valid = new Set(Object.values(TaskStatus));
    if (statuses) {
      const keys = statuses.map((status) => status.key);
      if (new Set(keys).size !== keys.length || keys.some((key) => !valid.has(key as TaskStatus))) throw new BadRequestException('Workflow statuses contain duplicate or invalid keys');
      if (!statuses.some((status) => status.key === TaskStatus.Done && status.enabled)) throw new BadRequestException('Workflow must keep DONE enabled');
    }
    const validRoles = new Set(Object.values(WorkspaceRole));
    if (transitions?.some((transition) => !valid.has(transition.from as TaskStatus) || !valid.has(transition.to as TaskStatus) || transition.from === transition.to || transition.roles?.some((role) => !validRoles.has(role as WorkspaceRole)))) throw new BadRequestException('Workflow contains invalid transitions or roles');
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
      workflowStatuses: project.workflowStatuses ?? DEFAULT_WORKFLOW_STATUSES,
      workflowTransitions: project.workflowTransitions ?? DEFAULT_WORKFLOW_TRANSITIONS,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
