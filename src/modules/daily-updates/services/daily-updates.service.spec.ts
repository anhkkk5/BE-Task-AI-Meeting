import { ConflictException, ForbiddenException } from '@nestjs/common';
import { DailyMood } from '../../../common/enums/daily-mood.enum';
import { Project } from '../../projects/entities/project.entity';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { DailyUpdate } from '../entities/daily-update.entity';
import { DailyUpdatesRepository } from '../repositories/daily-updates.repository';
import { DailyUpdateAccessService } from './daily-update-access.service';
import { DailyUpdatesService } from './daily-updates.service';

describe('DailyUpdatesService', () => {
  let service: DailyUpdatesService;
  let dailyUpdatesRepository: jest.Mocked<
    Pick<
      DailyUpdatesRepository,
      'archive' | 'create' | 'findDuplicate' | 'findMy' | 'findTeam' | 'update'
    >
  >;
  let dailyUpdateAccessService: jest.Mocked<
    Pick<
      DailyUpdateAccessService,
      | 'assertCanEditDailyUpdate'
      | 'assertCanViewDailyUpdate'
      | 'assertCanViewTeamDailyUpdates'
      | 'assertCanWriteDailyUpdate'
      | 'assertDailyUpdateInProject'
    >
  >;
  let workspaceAccessService: jest.Mocked<
    Pick<
      WorkspaceAccessService,
      'assertWorkspaceActive' | 'assertWorkspaceMember'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<
      ProjectAccessService,
      'assertProjectActive' | 'assertProjectInWorkspace'
    >
  >;
  let sprintAccessService: jest.Mocked<
    Pick<SprintAccessService, 'assertSprintInProject'>
  >;

  const project = {
    id: 'project-id',
    workspaceId: 'workspace-id',
  } as Project;

  const sprint = {
    id: 'sprint-id',
    projectId: 'project-id',
    name: 'Sprint 1',
  } as Sprint;

  const dailyUpdate = {
    id: 'daily-update-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: 'sprint-id',
    userId: 'member-id',
    updateDate: '2026-06-20',
    yesterdayWork: 'Done task API',
    todayPlan: 'Write task tests',
    blockers: null,
    notes: 'Need review',
    mood: DailyMood.Normal,
    sprint,
    user: {
      id: 'member-id',
      fullName: 'Nguyen Van A',
      email: 'member@example.com',
      avatarUrl: null,
    },
    createdAt: new Date('2026-06-20T00:00:00.000Z'),
    updatedAt: new Date('2026-06-20T00:00:00.000Z'),
    deletedAt: null,
  } as DailyUpdate;

  beforeEach(() => {
    dailyUpdatesRepository = {
      archive: jest.fn(),
      create: jest.fn(),
      findDuplicate: jest.fn(),
      findMy: jest.fn(),
      findTeam: jest.fn(),
      update: jest.fn(),
    };
    dailyUpdateAccessService = {
      assertCanEditDailyUpdate: jest.fn(),
      assertCanViewDailyUpdate: jest.fn(),
      assertCanViewTeamDailyUpdates: jest.fn(),
      assertCanWriteDailyUpdate: jest.fn(),
      assertDailyUpdateInProject: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceActive: jest.fn(),
      assertWorkspaceMember: jest.fn(),
    };
    projectAccessService = {
      assertProjectActive: jest.fn(),
      assertProjectInWorkspace: jest.fn(),
    };
    sprintAccessService = {
      assertSprintInProject: jest.fn(),
    };

    projectAccessService.assertProjectActive.mockResolvedValue(project);
    projectAccessService.assertProjectInWorkspace.mockResolvedValue(project);
    sprintAccessService.assertSprintInProject.mockResolvedValue(sprint);

    service = new DailyUpdatesService(
      dailyUpdatesRepository as unknown as DailyUpdatesRepository,
      dailyUpdateAccessService as unknown as DailyUpdateAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      projectAccessService as unknown as ProjectAccessService,
      sprintAccessService as unknown as SprintAccessService,
    );
  });

  it('creates daily update for current user and trims text fields', async () => {
    dailyUpdatesRepository.findDuplicate.mockResolvedValue(null);
    dailyUpdatesRepository.create.mockResolvedValue(dailyUpdate);

    const response = await service.createDailyUpdate(
      'member-id',
      'workspace-id',
      'project-id',
      {
        sprintId: 'sprint-id',
        updateDate: '2026-06-20',
        yesterdayWork: ' Done task API ',
        todayPlan: ' Write task tests ',
        blockers: ' ',
        notes: ' Need review ',
        mood: DailyMood.Normal,
      },
    );

    expect(
      dailyUpdateAccessService.assertCanWriteDailyUpdate,
    ).toHaveBeenCalledWith('member-id', 'workspace-id');
    expect(sprintAccessService.assertSprintInProject).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
    expect(dailyUpdatesRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      userId: 'member-id',
      sprintId: 'sprint-id',
      updateDate: '2026-06-20',
      yesterdayWork: 'Done task API',
      todayPlan: 'Write task tests',
      blockers: null,
      notes: 'Need review',
      mood: DailyMood.Normal,
      needHelpFromId: null,
      generatedByAi: false,
      submissionStatus: 'SUBMITTED',
    }));
    expect(response.data.dailyUpdate.userId).toBe('member-id');
  });

  it('rejects duplicate daily update in the same project and date', async () => {
    dailyUpdatesRepository.findDuplicate.mockResolvedValue(dailyUpdate);

    await expect(
      service.createDailyUpdate('member-id', 'workspace-id', 'project-id', {
        updateDate: '2026-06-20',
        yesterdayWork: 'Done',
        todayPlan: 'Plan',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(dailyUpdatesRepository.create).not.toHaveBeenCalled();
  });

  it('does not hide viewer write permission error', async () => {
    dailyUpdateAccessService.assertCanWriteDailyUpdate.mockRejectedValue(
      new ForbiddenException('You can not write daily update'),
    );

    await expect(
      service.createDailyUpdate('viewer-id', 'workspace-id', 'project-id', {
        updateDate: '2026-06-20',
        yesterdayWork: 'Done',
        todayPlan: 'Plan',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(dailyUpdatesRepository.create).not.toHaveBeenCalled();
  });

  it('gets my daily updates after project and sprint filter checks', async () => {
    dailyUpdatesRepository.findMy.mockResolvedValue({
      items: [dailyUpdate],
      total: 1,
      page: 1,
      limit: 20,
    });

    const response = await service.getMyDailyUpdates(
      'member-id',
      'workspace-id',
      'project-id',
      {
        sprintId: 'sprint-id',
        page: 1,
        limit: 20,
      },
    );

    expect(sprintAccessService.assertSprintInProject).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
    expect(response.data.items).toHaveLength(1);
  });

  it('gets team daily updates for manager roles with member filter', async () => {
    dailyUpdatesRepository.findTeam.mockResolvedValue({
      items: [dailyUpdate],
      total: 1,
      page: 1,
      limit: 20,
    });

    const response = await service.getTeamDailyUpdates(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        memberId: 'member-id',
      },
    );

    expect(
      dailyUpdateAccessService.assertCanViewTeamDailyUpdates,
    ).toHaveBeenCalledWith('owner-id', 'workspace-id');
    expect(workspaceAccessService.assertWorkspaceMember).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(response.data.items[0].user?.email).toBe('member@example.com');
  });

  it('checks detail permission before returning another daily update', async () => {
    dailyUpdateAccessService.assertDailyUpdateInProject.mockResolvedValue(
      dailyUpdate,
    );

    await service.getDailyUpdateDetail(
      'owner-id',
      'workspace-id',
      'project-id',
      'daily-update-id',
    );

    expect(
      dailyUpdateAccessService.assertCanViewDailyUpdate,
    ).toHaveBeenCalledWith('owner-id', 'workspace-id', dailyUpdate);
  });

  it('updates only current user daily update', async () => {
    dailyUpdateAccessService.assertDailyUpdateInProject.mockResolvedValue(
      dailyUpdate,
    );
    dailyUpdatesRepository.update.mockResolvedValue({
      ...dailyUpdate,
      mood: DailyMood.Good,
    });

    const response = await service.updateDailyUpdate(
      'member-id',
      'workspace-id',
      'project-id',
      'daily-update-id',
      {
        mood: DailyMood.Good,
      },
    );

    expect(
      dailyUpdateAccessService.assertCanEditDailyUpdate,
    ).toHaveBeenCalledWith('member-id', dailyUpdate);
    expect(response.data.dailyUpdate.mood).toBe(DailyMood.Good);
  });

  it('rejects updating another user daily update', async () => {
    dailyUpdateAccessService.assertDailyUpdateInProject.mockResolvedValue(
      dailyUpdate,
    );
    dailyUpdateAccessService.assertCanEditDailyUpdate.mockImplementation(() => {
      throw new ForbiddenException('You can not update this daily update');
    });

    await expect(
      service.updateDailyUpdate(
        'another-member-id',
        'workspace-id',
        'project-id',
        'daily-update-id',
        {
          mood: DailyMood.Good,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(dailyUpdatesRepository.update).not.toHaveBeenCalled();
  });

  it('archives own daily update without hard delete', async () => {
    dailyUpdateAccessService.assertDailyUpdateInProject.mockResolvedValue(
      dailyUpdate,
    );

    const response = await service.archiveDailyUpdate(
      'member-id',
      'workspace-id',
      'project-id',
      'daily-update-id',
    );

    expect(dailyUpdatesRepository.archive).toHaveBeenCalledWith(dailyUpdate);
    expect(response.data).toBeNull();
  });
});
