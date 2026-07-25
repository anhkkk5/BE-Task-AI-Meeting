import { ServiceUnavailableException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AiUserPreferencesService } from '../../users/services/ai-user-preferences.service';
import { AiPromptLogDocument } from '../schemas/ai-prompt-log.schema';
import {
  AiReportDocument,
  PersonalDailyReportOutput,
} from '../schemas/ai-report.schema';
import { AiPersonalReportService } from './ai-personal-report.service';
import { AiProviderService } from './ai-provider.service';
import { AiReportAccessService } from './ai-report-access.service';
import {
  AiReportDataBuilderService,
  PersonalReportInputData,
} from './ai-report-data-builder.service';
import { PromptBuilderService } from './prompt-builder.service';

type ModelMock<T> = Pick<
  Model<T>,
  'countDocuments' | 'create' | 'find' | 'findById' | 'findOne'
>;

describe('AiPersonalReportService', () => {
  let reportModel: jest.Mocked<ModelMock<AiReportDocument>>;
  let promptLogModel: jest.Mocked<Pick<Model<AiPromptLogDocument>, 'create'>>;
  let aiProviderService: jest.Mocked<
    Pick<AiProviderService, 'generatePersonalDailyReport'>
  >;
  let aiReportAccessService: jest.Mocked<
    Pick<
      AiReportAccessService,
      | 'assertCanManageMemberReports'
      | 'assertCanUseOwnReports'
      | 'assertCanViewReport'
    >
  >;
  let dataBuilderService: jest.Mocked<
    Pick<AiReportDataBuilderService, 'buildPersonalDailyReportInput'>
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;
  let promptBuilderService: jest.Mocked<
    Pick<PromptBuilderService, 'buildPersonalDailyReportPrompt'>
  >;
  let sprintAccessService: jest.Mocked<
    Pick<SprintAccessService, 'assertSprintInProject'>
  >;
  let workspaceAccessService: jest.Mocked<
    Pick<WorkspaceAccessService, 'assertWorkspaceMember'>
  >;
  let aiUserPreferencesService: jest.Mocked<
    Pick<AiUserPreferencesService, 'getResolvedPreferences'>
  >;
  let service: AiPersonalReportService;

  const reportId = new Types.ObjectId();
  const aiOutput: PersonalDailyReportOutput = {
    title: 'Bao cao giao ban ca nhan - Nguyen Van A',
    summary: 'Summary',
    generatedText: 'Generated report',
    completedTasks: [],
    inProgressTasks: [],
    blockers: [],
    risks: [],
    recommendations: [],
  };
  const inputData: PersonalReportInputData = {
    user: {
      id: 'member-id',
      fullName: 'Nguyen Van A',
      email: 'member@example.com',
      role: 'MEMBER',
    },
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
    reportDate: '2026-06-20',
    dailyUpdate: null,
    tasks: [],
    taskSummary: {
      completed: [],
      inProgress: [],
      overdue: [],
    },
    handovers: {
      given: [],
      received: [],
      pendingForMe: 0,
    },
  };
  const report = {
    _id: reportId,
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    sprintId: null,
    userId: 'member-id',
    reportType: AiReportType.PersonalDailyReport,
    reportDate: '2026-06-20',
    inputData,
    aiOutput,
    aiModel: 'mock-personal-report',
    status: AiReportStatus.Completed,
    createdBy: 'member-id',
    createdAt: new Date('2026-06-20T00:00:00.000Z'),
    updatedAt: new Date('2026-06-20T00:00:00.000Z'),
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
      generatePersonalDailyReport: jest.fn(),
    };
    aiReportAccessService = {
      assertCanManageMemberReports: jest.fn(),
      assertCanUseOwnReports: jest.fn(),
      assertCanViewReport: jest.fn(),
    };
    dataBuilderService = {
      buildPersonalDailyReportInput: jest.fn(),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn(),
    };
    promptBuilderService = {
      buildPersonalDailyReportPrompt: jest.fn(),
    };
    sprintAccessService = {
      assertSprintInProject: jest.fn(),
    };
    workspaceAccessService = {
      assertWorkspaceMember: jest.fn(),
    };
    aiUserPreferencesService = {
      getResolvedPreferences: jest.fn().mockResolvedValue({
        responseStyle: 'BALANCED',
        tone: 'PROFESSIONAL',
        focusAreas: ['PROGRESS', 'BLOCKERS', 'DECISIONS', 'ACTION_ITEMS'],
      }),
    } as never;

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
      exec: jest.fn().mockResolvedValue(null),
    } as never);
    dataBuilderService.buildPersonalDailyReportInput.mockResolvedValue(
      inputData as never,
    );
    promptBuilderService.buildPersonalDailyReportPrompt.mockReturnValue(
      'safe prompt',
    );
    aiProviderService.generatePersonalDailyReport.mockResolvedValue({
      model: 'mock-personal-report',
      output: aiOutput,
      rawResponse: JSON.stringify(aiOutput),
    });

    service = new AiPersonalReportService(
      reportModel as unknown as Model<AiReportDocument>,
      promptLogModel as unknown as Model<AiPromptLogDocument>,
      aiProviderService as unknown as AiProviderService,
      aiReportAccessService as unknown as AiReportAccessService,
      dataBuilderService as unknown as AiReportDataBuilderService,
      projectAccessService as unknown as ProjectAccessService,
      promptBuilderService as unknown as PromptBuilderService,
      sprintAccessService as unknown as SprintAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      aiUserPreferencesService as unknown as AiUserPreferencesService,
    );
  });

  it('generates own report from current user and logs prompt response', async () => {
    const response = await service.generateMyPersonalDailyReport(
      'member-id',
      'workspace-id',
      'project-id',
      {
        reportDate: '2026-06-20',
      },
    );

    expect(aiReportAccessService.assertCanUseOwnReports).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(
      dataBuilderService.buildPersonalDailyReportInput,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      targetUserId: 'member-id',
      reportDate: '2026-06-20',
      sprintId: undefined,
    });
    expect(reportModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        userId: 'member-id',
        createdBy: 'member-id',
        reportType: AiReportType.PersonalDailyReport,
        aiModel: 'mock-personal-report',
      }),
    );
    expect(promptLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'safe prompt',
        success: true,
      }),
    );
    expect(response.data.report.id).toBe(reportId.toString());
  });

  it('generates member report only through manager mode', async () => {
    await service.generateMemberPersonalDailyReport(
      'owner-id',
      'workspace-id',
      'project-id',
      'member-id',
      {
        reportDate: '2026-06-20',
        sprintId: 'sprint-id',
      },
    );

    expect(
      aiReportAccessService.assertCanManageMemberReports,
    ).toHaveBeenCalledWith('owner-id', 'workspace-id');
    expect(workspaceAccessService.assertWorkspaceMember).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
    );
    expect(sprintAccessService.assertSprintInProject).toHaveBeenCalledWith(
      'sprint-id',
      'project-id',
    );
  });

  it('skips scheduled personal report when the daily report already exists', async () => {
    reportModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(report),
    } as never);

    const response = await service.generateScheduledPersonalDailyReport(
      'owner-id',
      'workspace-id',
      'project-id',
      'member-id',
      '2026-06-20',
    );

    expect(response).toEqual({
      generated: false,
      reportId: reportId.toString(),
    });
    expect(reportModel.findOne).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      sprintId: null,
      userId: 'member-id',
      reportType: AiReportType.PersonalDailyReport,
      reportDate: '2026-06-20',
    });
    expect(
      aiProviderService.generatePersonalDailyReport,
    ).not.toHaveBeenCalled();
    expect(reportModel.create).not.toHaveBeenCalled();
  });

  it('returns 503 when MongoDB is disabled', async () => {
    const disabledService = new AiPersonalReportService(
      null,
      null,
      aiProviderService as unknown as AiProviderService,
      aiReportAccessService as unknown as AiReportAccessService,
      dataBuilderService as unknown as AiReportDataBuilderService,
      projectAccessService as unknown as ProjectAccessService,
      promptBuilderService as unknown as PromptBuilderService,
      sprintAccessService as unknown as SprintAccessService,
      workspaceAccessService as unknown as WorkspaceAccessService,
      aiUserPreferencesService as unknown as AiUserPreferencesService,
    );

    await expect(
      disabledService.generateMyPersonalDailyReport(
        'member-id',
        'workspace-id',
        'project-id',
        { reportDate: '2026-06-20' },
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('gets own report list with project and date filter checks', async () => {
    const response = await service.getMyPersonalDailyReports(
      'member-id',
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

  it('gets report detail after access check', async () => {
    const response = await service.getPersonalDailyReportDetail(
      'member-id',
      'workspace-id',
      'project-id',
      reportId.toString(),
    );

    expect(aiReportAccessService.assertCanViewReport).toHaveBeenCalledWith(
      'member-id',
      'workspace-id',
      report,
    );
    expect(response.data.report.inputData).toBeTruthy();
  });
});
