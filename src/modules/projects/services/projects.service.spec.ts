import { BadRequestException, ConflictException } from '@nestjs/common';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Project } from '../entities/project.entity';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectAccessService } from './project-access.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectsRepository: jest.Mocked<
    Pick<
      ProjectsRepository,
      | 'archive'
      | 'complete'
      | 'create'
      | 'findByWorkspace'
      | 'findByWorkspaceAndKeyCode'
      | 'update'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;
  let workspaceAccessService: jest.Mocked<
    Pick<
      WorkspaceAccessService,
      'assertWorkspaceActive' | 'assertWorkspaceMember'
    >
  >;

  const project = {
    id: 'project-id',
    workspaceId: 'workspace-id',
    name: 'Agile AI',
    keyCode: 'AGILEAI',
    description: 'Project demo',
    status: ProjectStatus.Active,
    startDate: '2026-06-18',
    endDate: '2026-07-18',
    createdBy: 'owner-id',
    createdAt: new Date('2026-06-18T00:00:00.000Z'),
    updatedAt: new Date('2026-06-18T00:00:00.000Z'),
    deletedAt: null,
  } as Project;

  beforeEach(() => {
    projectsRepository = {
      archive: jest.fn(),
      complete: jest.fn(),
      create: jest.fn(),
      findByWorkspace: jest.fn(),
      findByWorkspaceAndKeyCode: jest.fn(),
      update: jest.fn(),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceActive: jest.fn(),
      assertWorkspaceMember: jest.fn(),
    };
    workspaceAccessService.assertWorkspaceMember.mockResolvedValue({
      role: WorkspaceRole.ProjectManager,
    } as WorkspaceMember);
    service = new ProjectsService(
      projectsRepository as unknown as ProjectsRepository,
      projectAccessService as unknown as ProjectAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
    );
  });

  it('creates project with normalized keyCode and current user as creator', async () => {
    projectsRepository.findByWorkspaceAndKeyCode.mockResolvedValue(null);
    projectsRepository.create.mockResolvedValue(project);

    const response = await service.createProject('owner-id', 'workspace-id', {
      name: ' Agile AI ',
      keyCode: 'AGILEAI',
      description: ' Project demo ',
      startDate: '2026-06-18',
      endDate: '2026-07-18',
    });

    expect(workspaceAccessService.assertWorkspaceActive).toHaveBeenCalledWith(
      'workspace-id',
    );
    expect(projectsRepository.create).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      name: 'Agile AI',
      keyCode: 'AGILEAI',
      description: 'Project demo',
      startDate: '2026-06-18',
      endDate: '2026-07-18',
      createdBy: 'owner-id',
    });
    expect(response.data.project.keyCode).toBe('AGILEAI');
  });

  it('rejects duplicated keyCode in the same workspace', async () => {
    projectsRepository.findByWorkspaceAndKeyCode.mockResolvedValue(project);

    await expect(
      service.createProject('owner-id', 'workspace-id', {
        name: 'Agile AI',
        keyCode: 'AGILEAI',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(projectsRepository.create).not.toHaveBeenCalled();
  });

  it('rejects invalid date range', async () => {
    await expect(
      service.createProject('owner-id', 'workspace-id', {
        name: 'Agile AI',
        keyCode: 'AGILEAI',
        startDate: '2026-07-18',
        endDate: '2026-06-18',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('gets projects after workspace membership check', async () => {
    projectsRepository.findByWorkspace.mockResolvedValue({
      items: [project],
      total: 1,
      page: 1,
      limit: 10,
    });

    const response = await service.getProjects('member-id', 'workspace-id', {
      status: ProjectStatus.Active,
      page: 1,
      limit: 10,
    });

    expect(workspaceAccessService.assertWorkspaceMember).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(response.data.items).toHaveLength(1);
    expect(response.data.meta.total).toBe(1);
  });

  it('gets project detail only by projectId and workspaceId', async () => {
    projectAccessService.assertProjectInWorkspace.mockResolvedValue(project);

    const response = await service.getProjectDetail(
      'member-id',
      'workspace-id',
      'project-id',
    );

    expect(projectAccessService.assertProjectInWorkspace).toHaveBeenCalledWith(
      'project-id',
      'workspace-id',
    );
    expect(response.data.project.id).toBe('project-id');
  });

  it('updates project without changing keyCode/status/workspaceId/createdBy', async () => {
    projectAccessService.assertProjectInWorkspace.mockResolvedValue(project);
    projectsRepository.update.mockResolvedValue({
      ...project,
      name: 'Updated Agile AI',
    });

    const response = await service.updateProject(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        name: ' Updated Agile AI ',
        description: 'Updated',
      },
    );

    expect(projectsRepository.update).toHaveBeenCalledWith(project, {
      name: 'Updated Agile AI',
      description: 'Updated',
      startDate: project.startDate,
      endDate: project.endDate,
    });
    expect(response.data.project.keyCode).toBe('AGILEAI');
  });

  it('archives project without hard delete', async () => {
    projectAccessService.assertProjectInWorkspace.mockResolvedValue(project);

    const response = await service.archiveProject(
      'owner-id',
      'workspace-id',
      'project-id',
    );

    expect(projectsRepository.archive).toHaveBeenCalledWith(project);
    expect(response.data).toBeNull();
  });

  it('completes project', async () => {
    projectAccessService.assertProjectInWorkspace.mockResolvedValue(project);

    const response = await service.completeProject(
      'owner-id',
      'workspace-id',
      'project-id',
    );

    expect(projectsRepository.complete).toHaveBeenCalledWith(project);
    expect(response.message).toBe('Complete project successfully');
  });
});
