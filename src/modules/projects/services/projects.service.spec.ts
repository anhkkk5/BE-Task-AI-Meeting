import { BadRequestException } from '@nestjs/common';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Project } from '../entities/project.entity';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectAccessService } from './project-access.service';
import { ProjectKeyCodeService } from './project-key-code.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectsRepository: jest.Mocked<
    Pick<
      ProjectsRepository,
      | 'archive'
      | 'complete'
      | 'countTasksByProjects'
      | 'create'
      | 'findByWorkspace'
      | 'update'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<
      ProjectAccessService,
      'assertProjectDetailInWorkspace' | 'assertProjectInWorkspace'
    >
  >;
  let projectKeyCodeService: jest.Mocked<
    Pick<ProjectKeyCodeService, 'generateUniqueKeyCode'>
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
      countTasksByProjects: jest.fn().mockResolvedValue(new Map()),
      create: jest.fn(),
      findByWorkspace: jest.fn(),
      update: jest.fn(),
    };
    projectAccessService = {
      assertProjectDetailInWorkspace: jest.fn(),
      assertProjectInWorkspace: jest.fn(),
    };
    projectKeyCodeService = {
      generateUniqueKeyCode: jest.fn().mockResolvedValue('AGILEAI'),
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
      projectKeyCodeService as unknown as ProjectKeyCodeService,
      workspaceAccessService as unknown as WorkspaceAccessService,
    );
  });

  it('creates project with generated keyCode and current user as creator', async () => {
    projectsRepository.create.mockResolvedValue(project);

    const response = await service.createProject('owner-id', 'workspace-id', {
      name: ' Agile AI ',
      description: ' Project demo ',
      startDate: '2026-06-18',
      endDate: '2026-07-18',
    });

    expect(workspaceAccessService.assertWorkspaceActive).toHaveBeenCalledWith(
      'workspace-id',
    );
    expect(projectKeyCodeService.generateUniqueKeyCode).toHaveBeenCalledWith(
      'workspace-id',
      'Agile AI',
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

  it('rejects invalid date range before generating keyCode', async () => {
    await expect(
      service.createProject('owner-id', 'workspace-id', {
        name: 'Agile AI',
        startDate: '2026-07-18',
        endDate: '2026-06-18',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(projectKeyCodeService.generateUniqueKeyCode).not.toHaveBeenCalled();
  });

  it('gets projects after workspace membership check', async () => {
    projectsRepository.findByWorkspace.mockResolvedValue({
      items: [project],
      total: 1,
      page: 1,
      limit: 10,
    });
    projectsRepository.countTasksByProjects.mockResolvedValue(
      new Map([
        ['project-id', { totalTasks: 33, completedTasks: 11 }],
      ]),
    );

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
    expect(response.data.items[0]).toMatchObject({
      totalTasks: 33,
      completedTasks: 11,
    });
    expect(response.data.meta.total).toBe(1);
  });

  it('gets project detail with creator profile instead of raw id', async () => {
    projectAccessService.assertProjectDetailInWorkspace.mockResolvedValue({
      ...project,
      creator: {
        id: 'owner-id',
        fullName: 'Nguyen Van A',
        email: 'a@example.com',
        avatarUrl: null,
      },
    } as Project);

    const response = await service.getProjectDetail(
      'member-id',
      'workspace-id',
      'project-id',
    );

    expect(
      projectAccessService.assertProjectDetailInWorkspace,
    ).toHaveBeenCalledWith('project-id', 'workspace-id');
    expect(response.data.project.id).toBe('project-id');
    expect(response.data.project.createdByUser).toEqual({
      id: 'owner-id',
      fullName: 'Nguyen Van A',
      email: 'a@example.com',
      avatarUrl: null,
    });
  });

  it('keeps project detail working when creator relation is missing', async () => {
    projectAccessService.assertProjectDetailInWorkspace.mockResolvedValue(
      project,
    );

    const response = await service.getProjectDetail(
      'member-id',
      'workspace-id',
      'project-id',
    );

    expect(response.data.project.createdByUser).toBeNull();
    expect(response.data.project.createdBy).toBe('owner-id');
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
