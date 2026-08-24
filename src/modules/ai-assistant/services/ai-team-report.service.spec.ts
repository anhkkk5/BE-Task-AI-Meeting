import {
  ForbiddenException,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { AiReportReviewStatus } from '../../../common/enums/ai-report-review-status.enum';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import {
  AiReportDocument,
  TeamDailyReportOutput,
} from '../schemas/ai-report.schema';
import { AiProviderService } from './ai-provider.service';
import { AiReportAccessService } from './ai-report-access.service';
import { AiReportEventsService } from './ai-report-events.service';
import {
  AiTeamReportDataBuilderService,
  TeamReportInputData,
} from './ai-team-report-data-builder.service';
import { AiTeamReportService } from './ai-team-report.service';
import { PromptBuilderService } from './prompt-builder.service';

type ModelMock<T> = Pick<
  Model<T>,
  'countDocuments' | 'create' | 'find' | 'findById' | 'findOne'
>;

describe('AiTeamReportService', () => {
  let reportModel: jest.Mocked<ModelMock<AiReportDocument>>;
  let promptLogModel: jest.Mocked<Pick<Model<AiPromptLogDocument>, 'create'>>;
  let aiProviderService: jest.Mocked<
    Pick<AiProviderService, 'generateTeamDailyReport'>
  >;
  let aiReportAccessService: jest.Mocked<
    Pick<
      AiReportAccessService,
      'assertCanUseTeamReports' | 'assertCanViewTeamReport' | 'isManagerRole'
    >
  >;
  let dataBuilderService: jest.Mocked<
    Pick<
      AiTeamReportDataBuilderService,
      'buildTeamReportInput' | 'computeMetrics'
    >
  >;
  let aiReportEventsService: jest.Mocked<
    Pick<AiReportEventsService, 'publish'>
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;
  let promptBuilderService: jest.Mocked<
    Pick<PromptBuilderService, 'buildTeamDailyReportPrompt'>
  >;
  let sprintAccessService: jest.Mocked<
    Pick<SprintAccessService, 'assertSprintInProject'>
  >;
  let service: AiTeamReportService;

  const reportId = new Types.ObjectId();
  const aiOutput: TeamDailyReportOutput = {
    title: 'Bao cao giao ban nhom - Sprint 1',
    summary: 'Team dang tien trien on.',
    teamProgress: 'DONE: 1. IN_PROGRESS: 1.',
    completedWork: ['AGILEAI-1 - API daily update'],
    todayFocus: ['Nguyen Van A: Viet test'],
    blockers: ['Nguyen Van B: Can transcript format'],
    risks: ['AGILEAI-2 qua han.'],
    missingDailyUpdates: ['Nguyen Van C chua gui daily update.'],
    memberSummaries: [
      {
        userId: 'member-id',
        fullName: 'Nguyen Van A',
        summary: 'Hoan thanh API, hom nay viet test.',
        blockers: [],
      },
    ],
    recommendations: ['Xu ly blocker transcript format.'],
    generatedText: 'Generated team report',
  };
  const inputData: TeamReportInputData = {
    workspace: {
      id: 'workspace-id',
      name: 'Agile AI',
      slug: 'agile-ai',
    },
    project: {
      id: 'project-id',
      name: 'Project',
      keyCode: 'AGILEAI',
      status: 'ACTIVE',
    },
    sprint: null,
    reportDate: '2026-06-22',
    members: [
      {
        userId: 'member-id',
        fullName: 'Nguyen Van A',
        email: 'member@example.com',
        role: 'MEMBER',
      },
    ],
    dailyUpdates: [],
    missingDailyUpdateMembers: [],
    taskStats: {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 1,
      REVIEW: 0,
      DONE: 1,
      CANCELLED: 0,
    },
    tasks: [],
    overdueTasks: [],
    blockers: [],
    handovers: [],
    handoverStats: {
      total: 0,
      acknowledged: 0,
      pending: 0,
      changesRequested: 0,
      rejected: 0,
    },
    meetingNotes: [],
    previousReport: null,
    dataSources: {
      tasks: true,
      dailyUpdates: true,
      meetingTranscripts: true,
      previousReport: false,
    },
  };
  const metrics = {
    doneTasks: 1,
    totalTasks: 2,
    inProgressTasks: 1,
    blockerCount: 0,
    progressPercent: 50,
    memberCount: 1,
  };
  const report = {
    _id: reportId,
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    userId: null,
    reportType: AiReportType.TeamDailyReport,
    reportDate: '2026-06-22',
    inputData,
    aiOutput,
    aiModel: 'mock-team-report',
    status: AiReportStatus.Completed,
    createdBy: 'owner-id',
    createdAt: new Date('2026-06-22T00:00:00.000Z'),
    updatedAt: new Date('2026-06-22T00:00:00.000Z'),
  } as unknown as AiReportDocument;

  beforeEach(() => {
    reportModel = {
      countDocuments: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
    };
    promptLogModel = {
      create: jest.fn(),
    };
    aiProviderService = {
      generateTeamDailyReport: jest.fn(),
    };
    aiReportAccessService = {
      assertCanUseTeamReports: jest.fn(),
      assertCanViewTeamReport: jest.fn().mockResolvedValue(WorkspaceRole.Owner),
      isManagerRole: jest.fn().mockReturnValue(true),
    };
    dataBuilderService = {
      buildTeamReportInput: jest.fn(),
      computeMetrics: jest.fn().mockReturnValue(metrics),
    };
    aiReportEventsService = {
      publish: jest.fn(),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn(),
    };
    promptBuilderService = {
      buildTeamDailyReportPrompt: jest.fn(),
    };
    sprintAccessService = {
      assertSprintInProject: jest.fn(),
    };

    reportModel.create.mockResolvedValue(report as never);
    reportModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([report]),
    } as never);
    reportModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    } as never);
    reportModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(report),
    } as never);
    reportModel.findOne.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(report),
    } as never);
    dataBuilderService.buildTeamReportInput.mockResolvedValue(
      inputData as never,
    );
    promptBuilderService.buildTeamDailyReportPrompt.mockReturnValue(
      'safe team prompt',
    );
    aiProviderService.generateTeamDailyReport.mockResolvedValue({
      model: 'mock-team-report',
      output: aiOutput,
      rawResponse: JSON.stringify(aiOutput),
    });

    service = new AiTeamReportService(
      reportModel as unknown as Model<AiReportDocument>,
      promptLogModel as unknown as Model<AiPromptLogDocument>,
      aiProviderService as unknown as AiProviderService,
      aiReportAccessService as unknown as AiReportAccessService,
      dataBuilderService as unknown as AiTeamReportDataBuilderService,
      projectAccessService as unknown as ProjectAccessService,
      promptBuilderService as unknown as PromptBuilderService,
      sprintAccessService as unknown as SprintAccessService,
      aiReportEventsService as unknown as AiReportEventsService,
    );
  });

  it('generates team report with current user as createdBy', async () => {
    const response = await service.generateTeamDailyReport(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        reportDate: '2026-06-22',
      },
    );

    expect(aiReportAccessService.assertCanUseTeamReports).toHaveBeenCalledWith(
      'owner-id',
      'workspace-id',
    );
    expect(dataBuilderService.buildTeamReportInput).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      reportDate: '2026-06-22',
      sprintId: undefined,
      dataSources: undefined,
    });
    expect(reportModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        userId: null,
        createdBy: 'owner-id',
        reportType: AiReportType.TeamDailyReport,
        aiModel: 'mock-team-report',
      }),
    );
    expect(promptLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: AiReportType.TeamDailyReport,
        prompt: 'safe team prompt',
        userId: 'owner-id',
        success: true,
      }),
    );
    expect(response.data.report.id).toBe(reportId.toString());
  });

  it('checks sprint ownership when sprintId is provided', async () => {
    await service.generateTeamDailyReport(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        reportDate: '2026-06-22',
        sprintId: '550e8400-e29b-41d4-a716-446655440002',
      },
    );

    expect(sprintAccessService.assertSprintInProject).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440002',
      'project-id',
    );
  });

  it('skips scheduled team report when the daily report already exists', async () => {
    const response = await service.generateScheduledTeamDailyReport(
      'owner-id',
      'workspace-id',
      'project-id',
      '2026-06-22',
    );

    expect(response).toEqual({
      generated: false,
      reportId: reportId.toString(),
    });
    expect(reportModel.findOne).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      sprintId: null,
      userId: null,
      reportType: AiReportType.TeamDailyReport,
      reportDate: '2026-06-22',
    });
    expect(aiProviderService.generateTeamDailyReport).not.toHaveBeenCalled();
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it('gets team reports with date filters', async () => {
    const response = await service.getTeamDailyReports(
      'owner-id',
      'workspace-id',
      'project-id',
      {
        fromDate: '2026-06-01',
        toDate: '2026-06-30',
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

  it('gets latest team report', async () => {
    const response = await service.getLatestTeamDailyReport(
      'owner-id',
      'workspace-id',
      'project-id',
      {},
    );

    expect(reportModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        reportType: AiReportType.TeamDailyReport,
      }),
    );
    expect(response.data.report?.id).toBe(reportId.toString());
  });

  it('gets team report detail', async () => {
    const response = await service.getTeamDailyReportDetail(
      'owner-id',
      'workspace-id',
      'project-id',
      reportId.toString(),
    );

    expect(response.data.report.inputData).toBeTruthy();
    expect(response.data.report.userId).toBeNull();
    expect(response.data.canManage).toBe(true);
  });

  // Mail duyet bao cao gui cho moi thanh vien workspace nen link trong mail phai
  // mo duoc voi thanh vien thuong, neu khong ho chi thay loi 403.
  it('lets a plain member read a published team report without input data', async () => {
    aiReportAccessService.assertCanViewTeamReport.mockResolvedValue(
      WorkspaceRole.Member,
    );
    aiReportAccessService.isManagerRole.mockReturnValue(false);

    const response = await service.getTeamDailyReportDetail(
      'member-id',
      'workspace-id',
      'project-id',
      reportId.toString(),
    );

    expect(
      aiReportAccessService.assertCanUseTeamReports,
    ).not.toHaveBeenCalled();
    expect(response.data.canManage).toBe(false);
    // Du lieu dau vao la ban nhap noi bo, thanh vien chi can noi dung bao cao.
    expect(response.data.report.inputData).toBeUndefined();
  });

  it('hides a team report that is not published yet from plain members', async () => {
    aiReportAccessService.assertCanViewTeamReport.mockResolvedValue(
      WorkspaceRole.Member,
    );
    aiReportAccessService.isManagerRole.mockReturnValue(false);
    reportModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...report,
        reviewStatus: AiReportReviewStatus.PendingReview,
      }),
    } as never);

    await expect(
      service.getTeamDailyReportDetail(
        'member-id',
        'workspace-id',
        'project-id',
        reportId.toString(),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('still blocks plain members from approving a team report', async () => {
    aiReportAccessService.assertCanUseTeamReports.mockRejectedValue(
      new ForbiddenException('You can not use AI team reports'),
    );

    await expect(
      service.approveTeamDailyReport(
        'member-id',
        'workspace-id',
        'project-id',
        reportId.toString(),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 503 when MongoDB is disabled', async () => {
    const disabledService = new AiTeamReportService(
      null,
      null,
      aiProviderService as unknown as AiProviderService,
      aiReportAccessService as unknown as AiReportAccessService,
      dataBuilderService as unknown as AiTeamReportDataBuilderService,
      projectAccessService as unknown as ProjectAccessService,
      promptBuilderService as unknown as PromptBuilderService,
      sprintAccessService as unknown as SprintAccessService,
      aiReportEventsService as unknown as AiReportEventsService,
    );

    await expect(
      disabledService.generateTeamDailyReport(
        'owner-id',
        'workspace-id',
        'project-id',
        { reportDate: '2026-06-22' },
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('limits generate requests per project window', async () => {
    for (let index = 0; index < 5; index += 1) {
      await service.generateTeamDailyReport(
        'owner-id',
        'workspace-id',
        'project-id',
        { reportDate: '2026-06-22' },
      );
    }

    await expect(
      service.generateTeamDailyReport(
        'owner-id',
        'workspace-id',
        'project-id',
        { reportDate: '2026-06-22' },
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
