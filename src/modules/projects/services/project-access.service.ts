import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { ProjectsRepository } from '../repositories/projects.repository';

@Injectable()
export class ProjectAccessService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  getProjectInWorkspace(projectId: string, workspaceId: string) {
    return this.projectsRepository.findByIdAndWorkspace(projectId, workspaceId);
  }

  async assertProjectInWorkspace(projectId: string, workspaceId: string) {
    const project = await this.getProjectInWorkspace(projectId, workspaceId);

    if (!project) {
      throw new NotFoundException('Project not found in this workspace');
    }

    return project;
  }

  async assertProjectActive(projectId: string, workspaceId: string) {
    const project = await this.assertProjectInWorkspace(projectId, workspaceId);

    if (project.status !== ProjectStatus.Active) {
      throw new NotFoundException('Project not found in this workspace');
    }

    return project;
  }
}
