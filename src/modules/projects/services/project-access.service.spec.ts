import { NotFoundException } from '@nestjs/common';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { Project } from '../entities/project.entity';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectAccessService } from './project-access.service';

describe('ProjectAccessService - multi-tenancy boundary', () => {
  let service: ProjectAccessService;
  let projectsRepository: jest.Mocked<
    Pick<
      ProjectsRepository,
      'findByIdAndWorkspace' | 'findDetailByIdAndWorkspace'
    >
  >;

  const activeProject = {
    id: 'project-a',
    workspaceId: 'workspace-a',
    status: ProjectStatus.Active,
  } as Project;

  beforeEach(() => {
    projectsRepository = {
      findByIdAndWorkspace: jest.fn(),
      findDetailByIdAndWorkspace: jest.fn(),
    };
    service = new ProjectAccessService(
      projectsRepository as unknown as ProjectsRepository,
    );
  });

  it('returns a project only when projectId and workspaceId belong together', async () => {
    projectsRepository.findByIdAndWorkspace.mockResolvedValue(activeProject);

    await expect(
      service.assertProjectInWorkspace('project-a', 'workspace-a'),
    ).resolves.toBe(activeProject);
    expect(projectsRepository.findByIdAndWorkspace).toHaveBeenCalledWith(
      'project-a',
      'workspace-a',
    );
  });

  it('hides a project when another tenant workspaceId is supplied', async () => {
    projectsRepository.findByIdAndWorkspace.mockResolvedValue(null);

    await expect(
      service.assertProjectInWorkspace('project-a', 'workspace-b'),
    ).rejects.toThrow(
      new NotFoundException('Project not found in this workspace'),
    );
  });

  it('does not expose project details across workspace boundaries', async () => {
    projectsRepository.findDetailByIdAndWorkspace.mockResolvedValue(null);

    await expect(
      service.assertProjectDetailInWorkspace('project-a', 'workspace-b'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(projectsRepository.findDetailByIdAndWorkspace).toHaveBeenCalledWith(
      'project-a',
      'workspace-b',
    );
  });

  it('rejects archived projects even inside the correct workspace', async () => {
    projectsRepository.findByIdAndWorkspace.mockResolvedValue({
      ...activeProject,
      status: ProjectStatus.Archived,
    } as Project);

    await expect(
      service.assertProjectActive('project-a', 'workspace-a'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
