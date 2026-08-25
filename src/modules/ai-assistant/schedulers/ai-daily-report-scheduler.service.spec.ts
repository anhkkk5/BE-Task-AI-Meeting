import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import Redis from 'ioredis';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { Project } from '../../projects/entities/project.entity';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { UserStatus } from '../../users/enums/user-status.enum';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { AiPersonalReportService } from '../services/ai-personal-report.service';
import { AiTeamReportService } from '../services/ai-team-report.service';
import { AiDailyReportSchedulerService } from './ai-daily-report-scheduler.service';

describe('AiDailyReportSchedulerService', () => {
  let configValues: Map<string, string | boolean>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;
  let schedulerRegistry: jest.Mocked<Pick<SchedulerRegistry, 'addCronJob'>>;
  let redis: jest.Mocked<Pick<Redis, 'set' | 'eval'>>;
  let projectsRepository: jest.Mocked<
    Pick<ProjectsRepository, 'findActiveForAutomaticReports'>
  >;
  let workspaceMembersRepository: jest.Mocked<
    Pick<WorkspaceMembersRepository, 'findActiveByWorkspace'>
  >;
  let personalReportService: jest.Mocked<
    Pick<AiPersonalReportService, 'generateScheduledPersonalDailyReport'>
  >;
  let teamReportService: jest.Mocked<
    Pick<AiTeamReportService, 'generateScheduledTeamDailyReport'>
  >;
  let service: AiDailyReportSchedulerService;

  const project = {
    id: 'project-id',
    workspaceId: 'workspace-id',
    name: 'Du an Agile AI',
    keyCode: 'AGILE',
    description: null,
    status: ProjectStatus.Active,
    startDate: null,
    endDate: null,
    createdBy: 'owner-id',
    deletedAt: null,
  } as Project;

  const createMember = (
    userId: string,
    role: WorkspaceRole,
    userStatus = UserStatus.Active,
  ) =>
    ({
      id: `member-${userId}`,
      workspaceId: 'workspace-id',
      userId,
      role,
      status: WorkspaceMemberStatus.Active,
      joinedAt: new Date('2026-07-01T00:00:00.000Z'),
      user: {
        id: userId,
        status: userStatus,
      },
    }) as WorkspaceMember;

  beforeEach(() => {
    configValues = new Map<string, string | boolean>([
      ['AI_DAILY_REPORT_SCHEDULER_ENABLED', 'true'],
      ['MONGODB_ENABLED', 'true'],
      ['AI_DAILY_REPORT_TIMEZONE', 'Asia/Bangkok'],
      ['AI_DAILY_REPORT_INCLUDE_TEAM', 'true'],
      ['AI_DAILY_REPORT_LOCK_TTL_SECONDS', '3600'],
    ]);
    configService = {
      get: jest.fn((key: string, fallback?: string) =>
        configValues.has(key) ? configValues.get(key) : fallback,
      ),
    } as unknown as jest.Mocked<Pick<ConfigService, 'get'>>;
    schedulerRegistry = {
      addCronJob: jest.fn(),
    };
    redis = {
      set: jest.fn().mockResolvedValue('OK'),
      eval: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<Pick<Redis, 'set' | 'eval'>>;
    projectsRepository = {
      findActiveForAutomaticReports: jest.fn().mockResolvedValue([project]),
    };
    workspaceMembersRepository = {
      findActiveByWorkspace: jest.fn(),
    };
    personalReportService = {
      generateScheduledPersonalDailyReport: jest
        .fn()
        .mockResolvedValue({ generated: true, reportId: 'personal-report-id' }),
    };
    teamReportService = {
      generateScheduledTeamDailyReport: jest
        .fn()
        .mockResolvedValue({ generated: true, reportId: 'team-report-id' }),
    };

    service = new AiDailyReportSchedulerService(
      configService as unknown as ConfigService,
      schedulerRegistry as unknown as SchedulerRegistry,
      redis as unknown as Redis,
      projectsRepository as unknown as ProjectsRepository,
      workspaceMembersRepository as unknown as WorkspaceMembersRepository,
      personalReportService as unknown as AiPersonalReportService,
      teamReportService as unknown as AiTeamReportService,
    );
  });

  it('does not register the cron job when automatic reports are disabled', () => {
    configValues.set('AI_DAILY_REPORT_SCHEDULER_ENABLED', 'false');

    service.onApplicationBootstrap();

    expect(schedulerRegistry.addCronJob).not.toHaveBeenCalled();
  });

  it('does not run twice when another instance owns the Redis lock', async () => {
    redis.set.mockResolvedValue(null);

    const result = await service.runScheduledReports(
      new Date('2026-07-22T10:00:00.000Z'),
    );

    expect(result).toEqual({
      reportDate: '2026-07-22',
      projects: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
      lockAcquired: false,
    });
    expect(
      projectsRepository.findActiveForAutomaticReports,
    ).not.toHaveBeenCalled();
    expect(redis.eval).not.toHaveBeenCalled();
  });

  it('creates only the team report and leaves personal reporting to daily updates', async () => {
    const owner = createMember('owner-id', WorkspaceRole.Owner);
    const member = createMember('member-id', WorkspaceRole.Member);
    const viewer = createMember('viewer-id', WorkspaceRole.Viewer);
    const inactive = createMember(
      'inactive-id',
      WorkspaceRole.Member,
      UserStatus.Inactive,
    );
    workspaceMembersRepository.findActiveByWorkspace.mockResolvedValue([
      owner,
      member,
      viewer,
      inactive,
    ]);

    const result = await service.runScheduledReports(
      new Date('2026-07-22T10:00:00.000Z'),
    );

    expect(result).toEqual({
      reportDate: '2026-07-22',
      projects: 1,
      generated: 1,
      skipped: 0,
      failed: 0,
      lockAcquired: true,
    });
    expect(
      personalReportService.generateScheduledPersonalDailyReport,
    ).not.toHaveBeenCalled();
    expect(
      teamReportService.generateScheduledTeamDailyReport,
    ).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
      'project-id',
      '2026-07-22',
    );
    expect(redis.eval).toHaveBeenCalled();
  });

  it('does not call personal report generation even when members are active', async () => {
    workspaceMembersRepository.findActiveByWorkspace.mockResolvedValue([
      createMember('owner-id', WorkspaceRole.Owner),
      createMember('member-id', WorkspaceRole.Member),
    ]);
    teamReportService.generateScheduledTeamDailyReport.mockResolvedValue({
      generated: false,
      reportId: 'existing-team-report-id',
    });

    const result = await service.runScheduledReports(
      new Date('2026-07-22T10:00:00.000Z'),
    );

    expect(result.generated).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.failed).toBe(0);
    expect(
      personalReportService.generateScheduledPersonalDailyReport,
    ).not.toHaveBeenCalled();
    expect(
      teamReportService.generateScheduledTeamDailyReport,
    ).toHaveBeenCalledTimes(1);
  });
});
