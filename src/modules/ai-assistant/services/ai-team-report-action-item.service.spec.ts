import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { AiReportReviewStatus } from '../../../common/enums/ai-report-review-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import {
  TeamReportActionItemSource,
  TeamReportActionItemStatus,
} from '../../../common/enums/team-report-action-item-status.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { TasksService } from '../../tasks/services/tasks.service';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { TeamReportActionItem } from '../entities/team-report-action-item.entity';
import { TeamReportActionItemsRepository } from '../repositories/team-report-action-items.repository';
import { AiReportDocument } from '../schemas/ai-report.schema';
import { AiReportAccessService } from './ai-report-access.service';
import { AiTeamReportActionItemService } from './ai-team-report-action-item.service';

type ReportModelMock = Pick<Model<AiReportDocument>, 'findById'>;

describe('AiTeamReportActionItemService', () => {
  let reportModel: jest.Mocked<ReportModelMock>;
  let actionItemsRepository: jest.Mocked<
    Pick<TeamReportActionItemsRepository, 'findByReport' | 'findOne' | 'save'>
  >;
  let aiReportAccessService: jest.Mocked<
    Pick<
      AiReportAccessService,
      'assertCanUseTeamReports' | 'assertCanViewTeamReport' | 'isManagerRole'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;
  let tasksService: jest.Mocked<Pick<TasksService, 'createTask'>>;
  let tasksRepository: jest.Mocked<Pick<TasksRepository, 'findByIdAndProject'>>;
  let workspaceMembers: jest.Mocked<
    Pick<WorkspaceMembersRepository, 'findActiveByWorkspaceAndUser'>
  >;
  let service: AiTeamReportActionItemService;

  const report = {
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    reportType: AiReportType.TeamDailyReport,
    reportDate: '2026-07-26',
    reviewStatus: AiReportReviewStatus.Published,
    aiOutput: {
      blockers: ['Chua co moi truong staging de kiem thu'],
      recommendations: ['Chot nguoi phu trach kiem thu truoc thu Sau'],
    },
  } as unknown as AiReportDocument;

  beforeEach(() => {
    reportModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(report),
      } as never),
    };
    actionItemsRepository = {
      findByReport: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    };
    aiReportAccessService = {
      assertCanUseTeamReports: jest.fn().mockResolvedValue({} as never),
      assertCanViewTeamReport: jest
        .fn()
        .mockResolvedValue(WorkspaceRole.Owner),
      isManagerRole: jest.fn().mockReturnValue(true),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn().mockResolvedValue({} as never),
    };
    tasksService = {
      createTask: jest.fn().mockResolvedValue({
        data: { task: { id: 'task-id' } },
      } as never),
    };
    tasksRepository = {
      findByIdAndProject: jest.fn().mockResolvedValue({
        id: 'task-id',
        assigneeId: 'owner-id',
      } as never),
    };
    workspaceMembers = {
      findActiveByWorkspaceAndUser: jest
        .fn()
        .mockResolvedValue({ id: 'member-id' } as never),
    };

    service = new AiTeamReportActionItemService(
      reportModel as unknown as Model<AiReportDocument>,
      actionItemsRepository as unknown as TeamReportActionItemsRepository,
      aiReportAccessService as unknown as AiReportAccessService,
      projectAccessService as unknown as ProjectAccessService,
      tasksService as unknown as TasksService,
      tasksRepository as unknown as TasksRepository,
      workspaceMembers as unknown as WorkspaceMembersRepository,
    );
  });

  it('gop vuong mac va de xuat thanh mot danh sach kem trang thai', async () => {
    actionItemsRepository.findByReport.mockResolvedValue([
      {
        source: TeamReportActionItemSource.Blocker,
        itemIndex: 0,
        status: TeamReportActionItemStatus.TaskCreated,
        createdTaskId: 'task-id',
      } as TeamReportActionItem,
    ]);

    const result = await service.getActionItems(
      'user-id',
      'workspace-id',
      'project-id',
      'report-id',
    );

    expect(result.data.items).toHaveLength(2);
    expect(result.data.items[0]).toMatchObject({
      source: TeamReportActionItemSource.Blocker,
      status: TeamReportActionItemStatus.TaskCreated,
      createdTaskId: 'task-id',
    });
    expect(result.data.items[1]).toMatchObject({
      source: TeamReportActionItemSource.Recommendation,
      status: TeamReportActionItemStatus.Pending,
    });
    expect(result.data.canHandle).toBe(true);
  });

  it('cho thanh vien thuong doc danh sach cua ban da phat hanh nhung khong chot duoc', async () => {
    aiReportAccessService.assertCanViewTeamReport.mockResolvedValue(
      WorkspaceRole.Member,
    );
    aiReportAccessService.isManagerRole.mockReturnValue(false);

    const result = await service.getActionItems(
      'member-id',
      'workspace-id',
      'project-id',
      'report-id',
    );

    expect(result.data.items).toHaveLength(2);
    expect(result.data.canHandle).toBe(false);
    expect(aiReportAccessService.assertCanUseTeamReports).not.toHaveBeenCalled();
  });

  it('an danh sach cua phien chua phat hanh voi thanh vien thuong', async () => {
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
      service.getActionItems(
        'member-id',
        'workspace-id',
        'project-id',
        'report-id',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('van chan thanh vien thuong tao task tu de xuat', async () => {
    aiReportAccessService.assertCanUseTeamReports.mockRejectedValue(
      new ForbiddenException('You can not use AI team reports'),
    );

    await expect(
      service.createTaskFromActionItem(
        'member-id',
        'workspace-id',
        'project-id',
        'report-id',
        {
          source: TeamReportActionItemSource.Blocker,
          itemIndex: 0,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tasksService.createTask).not.toHaveBeenCalled();
  });

  it('tao task voi noi dung doc lai tu bao cao, khong lay tu client', async () => {
    const result = await service.createTaskFromActionItem(
      'user-id',
      'workspace-id',
      'project-id',
      'report-id',
      {
        source: TeamReportActionItemSource.Blocker,
        itemIndex: 0,
      },
    );

    expect(tasksService.createTask).toHaveBeenCalledWith(
      'user-id',
      'workspace-id',
      'project-id',
      expect.objectContaining({
        title: 'Chua co moi truong staging de kiem thu',
      }),
    );
    expect(result.data.item.status).toBe(
      TeamReportActionItemStatus.TaskCreated,
    );
    expect(result.data.item.createdTaskId).toBe('task-id');
  });

  it('khong cho xu ly lai muc da tao task', async () => {
    actionItemsRepository.findOne.mockResolvedValue({
      status: TeamReportActionItemStatus.TaskCreated,
    } as TeamReportActionItem);

    await expect(
      service.createTaskFromActionItem(
        'user-id',
        'workspace-id',
        'project-id',
        'report-id',
        { source: TeamReportActionItemSource.Blocker, itemIndex: 0 },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('ghi nhan de nghi ban giao ma khong tao ban ghi ban giao', async () => {
    const result = await service.requestHandoverFromActionItem(
      'user-id',
      'workspace-id',
      'project-id',
      'report-id',
      {
        source: TeamReportActionItemSource.Blocker,
        itemIndex: 0,
        taskId: 'task-id',
        suggestedReceiverId: 'receiver-id',
        note: 'Nen chuyen cho ban khac de kip han',
      },
    );

    expect(result.data.item).toMatchObject({
      status: TeamReportActionItemStatus.HandoverRequested,
      targetTaskId: 'task-id',
      suggestedReceiverId: 'receiver-id',
    });
    expect(result.data.item.handoverId).toBeNull();
  });

  it('tu choi de nghi ban giao cho chinh nguoi dang phu trach', async () => {
    tasksRepository.findByIdAndProject.mockResolvedValue({
      id: 'task-id',
      assigneeId: 'receiver-id',
    } as never);

    await expect(
      service.requestHandoverFromActionItem(
        'user-id',
        'workspace-id',
        'project-id',
        'report-id',
        {
          source: TeamReportActionItemSource.Blocker,
          itemIndex: 0,
          taskId: 'task-id',
          suggestedReceiverId: 'receiver-id',
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('luu ly do khi bo qua mot de xuat', async () => {
    const result = await service.dismissActionItem(
      'user-id',
      'workspace-id',
      'project-id',
      'report-id',
      TeamReportActionItemSource.Recommendation,
      0,
      { reason: 'Da xu ly trong buoi hop truoc' },
    );

    expect(result.data.item).toMatchObject({
      status: TeamReportActionItemStatus.Dismissed,
      note: 'Da xu ly trong buoi hop truoc',
    });
  });
});
