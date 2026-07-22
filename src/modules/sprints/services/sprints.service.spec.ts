import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { Sprint } from '../entities/sprint.entity';
import { SprintsRepository } from '../repositories/sprints.repository';
import { SprintAccessService } from './sprint-access.service';
import { SprintsService } from './sprints.service';

describe('SprintsService', () => {
  let service: SprintsService;
  let sprintsRepository: jest.Mocked<
    Pick<
      SprintsRepository,
      'create' | 'findByProject' | 'softDeleteWithTasks' | 'update'
    >
  >;
  let sprintAccessService: jest.Mocked<
    Pick<
      SprintAccessService,
      | 'assertProjectHasNoActiveSprint'
      | 'assertSprintActive'
      | 'assertSprintInProject'
      | 'assertSprintPlanned'
    >
  >;
  let workspaceAccessService: jest.Mocked<
    Pick<
      WorkspaceAccessService,
      'assertWorkspaceActive' | 'assertWorkspaceMember' | 'getUserWorkspaceRole'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<
      ProjectAccessService,
      'assertProjectActive' | 'assertProjectInWorkspace'
    >
  >;

  const sprint = {
    id: 'sprint-id',
    projectId: 'project-id',
    name: 'Sprint 1',
    goal: 'First sprint goal',
    status: SprintStatus.Planned,
    startDate: '2026-06-14',
    endDate: '2026-06-21',
    startedAt: null,
    completedAt: null,
    createdBy: 'owner-id',
    createdAt: new Date('2026-06-14T00:00:00.000Z'),
    updatedAt: new Date('2026-06-14T00:00:00.000Z'),
    deletedAt: null,
  } as Sprint;

  beforeEach(() => {
    sprintsRepository = {
      create: jest.fn(),
      findByProject: jest.fn(),
      softDeleteWithTasks: jest.fn(),
      update: jest.fn(),
    };
    sprintAccessService = {
      assertProjectHasNoActiveSprint: jest.fn(),
      assertSprintActive: jest.fn(),
      assertSprintInProject: jest.fn(),
      assertSprintPlanned: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceActive: jest.fn(),
      assertWorkspaceMember: jest.fn(),
      getUserWorkspaceRole: jest.fn(),
    };
    projectAccessService = {
      assertProjectActive: jest.fn(),
      assertProjectInWorkspace: jest.fn(),
    };
    workspaceAccessService.assertWorkspaceMember.mockResolvedValue(
      {} as WorkspaceMember,
    );
    service = new SprintsService(
      sprintsRepository as unknown as SprintsRepository,
      sprintAccessService as unknown as SprintAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      projectAccessService as unknown as ProjectAccessService,
    );
  });

  it('creates planned sprint in active project', async () => {
    sprintsRepository.create.mockResolvedValue(sprint);

    const response = await service.createSprint(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        name: ' Sprint 1 ',
        goal: ' First sprint goal ',
        startDate: '2026-06-14',
        endDate: '2026-06-21',
      },
    );

    expect(workspaceAccessService.assertWorkspaceActive).toHaveBeenCalledWith(
      'workspace-id',
    );
    expect(projectAccessService.assertProjectActive).toHaveBeenCalledWith(
      'project-id',
      'workspace-id',
    );
    expect(sprintsRepository.create).toHaveBeenCalledWith({
      projectId: 'project-id',
      name: 'Sprint 1',
      goal: 'First sprint goal',
      startDate: '2026-06-14',
      endDate: '2026-06-21',
      createdBy: 'owner-id',
    });
    expect(response.data.sprint.status).toBe(SprintStatus.Planned);
  });

  it('rejects invalid date range on create', async () => {
    await expect(
      service.createSprint('owner-id', 'workspace-id', 'project-id', {
        name: 'Sprint 1',
        startDate: '2026-06-22',
        endDate: '2026-06-21',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(sprintsRepository.create).not.toHaveBeenCalled();
  });

  it('gets sprints only after workspace and project checks', async () => {
    sprintsRepository.findByProject.mockResolvedValue({
      items: [sprint],
      total: 1,
      page: 1,
      limit: 10,
    });

    const response = await service.getSprints(
      'member-id',
      'workspace-id',
      'project-id',
      {
        status: SprintStatus.Planned,
        page: 1,
        limit: 10,
      },
    );

    expect(projectAccessService.assertProjectInWorkspace).toHaveBeenCalledWith(
      'project-id',
      'workspace-id',
    );
    expect(response.data.items).toHaveLength(1);
    expect(response.data.meta.total).toBe(1);
  });

  it('updates only planned sprint', async () => {
    sprintAccessService.assertSprintPlanned.mockResolvedValue(sprint);
    sprintsRepository.update.mockResolvedValue({
      ...sprint,
      name: 'Updated Sprint',
    });

    const response = await service.updateSprint(
      'owner-id',
      'workspace-id',
      'project-id',
      'sprint-id',
      {
        name: ' Updated Sprint ',
      },
    );

    expect(sprintAccessService.assertSprintPlanned).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
    expect(response.data.sprint.name).toBe('Updated Sprint');
  });

  it('starts sprint when project has no other active sprint', async () => {
    sprintAccessService.assertSprintPlanned.mockResolvedValue(sprint);
    sprintsRepository.update.mockResolvedValue({
      ...sprint,
      status: SprintStatus.Active,
      startedAt: new Date('2026-06-14T01:00:00.000Z'),
    });

    const response = await service.startSprint(
      'owner-id',
      'workspace-id',
      'project-id',
      'sprint-id',
    );

    expect(
      sprintAccessService.assertProjectHasNoActiveSprint,
    ).toHaveBeenCalledWith('project-id', 'sprint-id');
    expect(response.data.sprint.status).toBe(SprintStatus.Active);
  });

  it('bubbles conflict when project already has active sprint', async () => {
    sprintAccessService.assertSprintPlanned.mockResolvedValue(sprint);
    sprintAccessService.assertProjectHasNoActiveSprint.mockRejectedValue(
      new ConflictException('This project already has an active sprint'),
    );

    await expect(
      service.startSprint(
        'owner-id',
        'workspace-id',
        'project-id',
        'sprint-id',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('completes active sprint', async () => {
    sprintAccessService.assertSprintActive.mockResolvedValue({
      ...sprint,
      status: SprintStatus.Active,
    });
    sprintsRepository.update.mockResolvedValue({
      ...sprint,
      status: SprintStatus.Completed,
      completedAt: new Date('2026-06-21T01:00:00.000Z'),
    });

    const response = await service.completeSprint(
      'owner-id',
      'workspace-id',
      'project-id',
      'sprint-id',
    );

    expect(response.data.sprint.status).toBe(SprintStatus.Completed);
  });

  it('cancels planned or active sprint only', async () => {
    sprintAccessService.assertSprintInProject.mockResolvedValue({
      ...sprint,
      status: SprintStatus.Completed,
    });

    await expect(
      service.cancelSprint(
        'owner-id',
        'workspace-id',
        'project-id',
        'sprint-id',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not hide workspace membership errors', async () => {
    workspaceAccessService.assertWorkspaceMember.mockRejectedValue(
      new ForbiddenException('You do not have access to this workspace'),
    );

    await expect(
      service.getSprintDetail(
        'member-id',
        'workspace-id',
        'project-id',
        'sprint-id',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the creator to delete an inactive sprint', async () => {
    sprintAccessService.assertSprintInProject.mockResolvedValue(sprint);

    const response = await service.deleteSprint(
      'owner-id',
      'workspace-id',
      'project-id',
      'sprint-id',
    );

    expect(sprintsRepository.softDeleteWithTasks).toHaveBeenCalledWith(sprint);
    expect(response.data).toBeNull();
  });

  it('does not allow deleting an active sprint', async () => {
    sprintAccessService.assertSprintInProject.mockResolvedValue({
      ...sprint,
      status: SprintStatus.Active,
    });

    await expect(
      service.deleteSprint(
        'owner-id',
        'workspace-id',
        'project-id',
        'sprint-id',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(sprintsRepository.softDeleteWithTasks).not.toHaveBeenCalled();
  });

  it('allows a manager to delete a sprint created by another user', async () => {
    sprintAccessService.assertSprintInProject.mockResolvedValue(sprint);
    workspaceAccessService.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.ProjectManager,
    );

    await service.deleteSprint(
      'manager-id',
      'workspace-id',
      'project-id',
      'sprint-id',
    );

    expect(sprintsRepository.softDeleteWithTasks).toHaveBeenCalledWith(sprint);
  });
});
