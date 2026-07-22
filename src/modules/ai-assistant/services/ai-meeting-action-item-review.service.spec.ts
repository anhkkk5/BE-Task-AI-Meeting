import { ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { MeetingActionItemReviewStatus } from '../../../common/enums/meeting-action-item-review-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { MeetingAccessService } from '../../meetings/services/meeting-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksService } from '../../tasks/services/tasks.service';
import { MeetingActionItemReview } from '../entities/meeting-action-item-review.entity';
import { MeetingActionItemReviewsRepository } from '../repositories/meeting-action-item-reviews.repository';
import { MeetingSummaryDocument } from '../schemas/meeting-summary.schema';
import { AiMeetingSummaryAccessService } from './ai-meeting-summary-access.service';
import { AiMeetingActionItemReviewService } from './ai-meeting-action-item-review.service';

type SummaryModelMock = Pick<Model<MeetingSummaryDocument>, 'findById'>;

describe('AiMeetingActionItemReviewService', () => {
  let summaryModel: jest.Mocked<SummaryModelMock>;
  let reviewsRepository: jest.Mocked<
    Pick<
      MeetingActionItemReviewsRepository,
      'findBySummary' | 'findOne' | 'save'
    >
  >;
  let summaryAccessService: jest.Mocked<
    Pick<
      AiMeetingSummaryAccessService,
      'assertCanGenerateSummary' | 'assertCanViewSummary'
    >
  >;
  let projectAccessService: jest.Mocked<
    Pick<ProjectAccessService, 'assertProjectInWorkspace'>
  >;
  let meetingAccessService: jest.Mocked<
    Pick<MeetingAccessService, 'assertMeetingInProject'>
  >;
  let tasksService: jest.Mocked<Pick<TasksService, 'createTask'>>;
  let service: AiMeetingActionItemReviewService;

  const summary = {
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    meetingId: 'meeting-id',
    actionItems: [
      {
        text: 'Hoan thien API dang nhap',
        assigneeName: 'Nguyen Van A',
        assigneeUserId: 'member-id',
        dueDate: '2026-07-25',
        status: 'OPEN',
        source: 'Nguyen Van A se hoan thien API dang nhap',
      },
    ],
  } as unknown as MeetingSummaryDocument;

  const pendingReview = {
    id: 'review-id',
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    meetingId: 'meeting-id',
    summaryId: 'summary-id',
    actionItemIndex: 0,
    actionItemText: 'Hoan thien API dang nhap',
    suggestedAssigneeName: 'Nguyen Van A',
    suggestedDueDate: '2026-07-25',
    status: MeetingActionItemReviewStatus.Pending,
    reviewedBy: null,
    reviewedAt: null,
    createdTaskId: null,
    rejectionReason: null,
  } as MeetingActionItemReview;

  beforeEach(() => {
    summaryModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(summary),
      } as never),
    };
    reviewsRepository = {
      findBySummary: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    summaryAccessService = {
      assertCanGenerateSummary: jest
        .fn()
        .mockResolvedValue(WorkspaceRole.Owner),
      assertCanViewSummary: jest.fn().mockResolvedValue(WorkspaceRole.Member),
    };
    projectAccessService = {
      assertProjectInWorkspace: jest.fn().mockResolvedValue({} as never),
    };
    meetingAccessService = {
      assertMeetingInProject: jest.fn().mockResolvedValue({} as never),
    };
    tasksService = {
      createTask: jest.fn(),
    };

    service = new AiMeetingActionItemReviewService(
      summaryModel as unknown as Model<MeetingSummaryDocument>,
      reviewsRepository as unknown as MeetingActionItemReviewsRepository,
      summaryAccessService as unknown as AiMeetingSummaryAccessService,
      projectAccessService as unknown as ProjectAccessService,
      meetingAccessService as unknown as MeetingAccessService,
      tasksService as unknown as TasksService,
    );
  });

  it('returns pending action items and manager review permission', async () => {
    summaryAccessService.assertCanViewSummary.mockResolvedValue(
      WorkspaceRole.ProjectManager,
    );

    const response = await service.getActionItems(
      'manager-id',
      'workspace-id',
      'project-id',
      'summary-id',
    );

    expect(response.data.canReview).toBe(true);
    expect(response.data.items).toEqual([
      expect.objectContaining({
        index: 0,
        reviewStatus: MeetingActionItemReviewStatus.Pending,
        createdTaskId: null,
      }),
    ]);
  });

  it('approves an action item and creates one backlog task', async () => {
    reviewsRepository.save
      .mockResolvedValueOnce(pendingReview)
      .mockImplementation(async (data) => data as MeetingActionItemReview);
    tasksService.createTask.mockResolvedValue({
      success: true,
      message: 'Created',
      data: {
        task: {
          id: 'task-id',
          title: 'Hoan thien API dang nhap',
        },
      },
    } as never);

    const response = await service.approveActionItem(
      'manager-id',
      'workspace-id',
      'project-id',
      'summary-id',
      0,
      { assigneeId: 'member-id' },
    );

    expect(tasksService.createTask).toHaveBeenCalledTimes(1);
    expect(tasksService.createTask).toHaveBeenCalledWith(
      'manager-id',
      'workspace-id',
      'project-id',
      expect.objectContaining({
        title: 'Hoan thien API dang nhap',
        assigneeId: 'member-id',
        dueDate: '2026-07-25',
      }),
    );
    expect(response.data.actionItem.reviewStatus).toBe(
      MeetingActionItemReviewStatus.TaskCreated,
    );
    expect(response.data.actionItem.createdTaskId).toBe('task-id');
  });

  it('does not create another task for an approved action item', async () => {
    reviewsRepository.findOne.mockResolvedValue({
      ...pendingReview,
      status: MeetingActionItemReviewStatus.TaskCreated,
      createdTaskId: 'task-id',
    });

    await expect(
      service.approveActionItem(
        'manager-id',
        'workspace-id',
        'project-id',
        'summary-id',
        0,
        {},
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tasksService.createTask).not.toHaveBeenCalled();
  });

  it('rejects an action item with the supplied reason', async () => {
    reviewsRepository.save.mockImplementation(
      async (data) => data as MeetingActionItemReview,
    );

    const response = await service.rejectActionItem(
      'manager-id',
      'workspace-id',
      'project-id',
      'summary-id',
      0,
      { reason: 'Chua du thong tin de tao task' },
    );

    expect(reviewsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: MeetingActionItemReviewStatus.Rejected,
        reviewedBy: 'manager-id',
        rejectionReason: 'Chua du thong tin de tao task',
      }),
    );
    expect(response.data.actionItem.reviewStatus).toBe(
      MeetingActionItemReviewStatus.Rejected,
    );
  });
});
