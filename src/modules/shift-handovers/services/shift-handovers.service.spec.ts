import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { Task } from '../../tasks/entities/task.entity';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { User } from '../../users/entities/user.entity';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { ShiftHandover } from '../entities/shift-handover.entity';
import { HandoverEvent } from '../events/handover.event';
import { ShiftHandoversRepository } from '../repositories/shift-handovers.repository';
import { HandoverEventsService } from './handover-events.service';
import { ShiftHandoversService } from './shift-handovers.service';

describe('ShiftHandoversService - bàn giao công việc', () => {
  let service: ShiftHandoversService;
  let repository: jest.Mocked<ShiftHandoversRepository>;
  let workspaceAccess: jest.Mocked<WorkspaceAccessService>;
  let workspaceMembers: jest.Mocked<WorkspaceMembersRepository>;
  let tasksRepository: jest.Mocked<TasksRepository>;
  /** Ghi lai su kien phat ra de kiem chung thong bao email duoc kich hoat. */
  let publishedEvents: HandoverEvent[];

  const user = (id: string, fullName: string) =>
    ({
      id,
      email: `${id}@example.com`,
      fullName,
      avatarUrl: null,
    }) as User;

  const task = (overrides: Partial<Task> = {}) =>
    ({
      id: 'task-id',
      projectId: 'project-id',
      sprintId: 'sprint-id',
      taskCode: 'TASK-12',
      title: 'Hoàn thiện chức năng đăng nhập',
      description: null,
      status: TaskStatus.InProgress,
      assigneeId: 'sender-id',
      assignee: user('sender-id', 'Người bàn giao'),
      createdBy: 'sender-id',
      dueDate: null,
      estimatedHours: null,
      storyPoints: null,
      createdAt: new Date('2026-07-22T08:00:00.000Z'),
      updatedAt: new Date('2026-07-22T08:00:00.000Z'),
      deletedAt: null,
      ...overrides,
    }) as Task;

  const handover = (overrides: Partial<ShiftHandover> = {}) =>
    ({
      id: 'handover-id',
      workspaceId: 'workspace-id',
      projectId: 'project-id',
      taskId: 'task-id',
      task: task(),
      senderId: 'sender-id',
      receiverId: 'receiver-id',
      sender: user('sender-id', 'Người bàn giao'),
      receiver: user('receiver-id', 'Người tiếp nhận'),
      title: 'TASK-12 - Hoàn thiện chức năng đăng nhập',
      summary: null,
      completedWork: 'Đã hoàn thiện API đăng nhập.',
      remainingWork: 'Cần bổ sung kiểm thử tích hợp.',
      blockers: null,
      nextSteps: 'Chạy bộ kiểm thử trước khi merge.',
      referenceLinks: null,
      dueAt: null,
      status: HandoverStatus.Draft,
      changeRequest: null,
      rejectionReason: null,
      submittedAt: null,
      acknowledgedAt: null,
      rejectedAt: null,
      createdAt: new Date('2026-07-22T08:00:00.000Z'),
      updatedAt: new Date('2026-07-22T08:00:00.000Z'),
      deletedAt: null,
      ...overrides,
    }) as ShiftHandover;

  beforeEach(() => {
    repository = {
      createHandover: jest.fn(),
      findOpenByTask: jest.fn(),
      findHandoverById: jest.fn(),
      findHandovers: jest.fn(),
      updateHandover: jest.fn(),
      acceptAndTransferTask: jest.fn(),
      softDeleteHandover: jest.fn(),
    } as unknown as jest.Mocked<ShiftHandoversRepository>;
    workspaceAccess = {
      assertWorkspaceActive: jest.fn().mockResolvedValue(undefined),
      assertWorkspaceMember: jest.fn().mockResolvedValue(undefined),
      getUserWorkspaceRole: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<WorkspaceAccessService>;
    workspaceMembers = {
      findActiveByWorkspaceAndUser: jest
        .fn()
        .mockResolvedValue({ id: 'member-id' }),
    } as unknown as jest.Mocked<WorkspaceMembersRepository>;
    tasksRepository = {
      findByIdAndProject: jest.fn().mockResolvedValue(task()),
    } as unknown as jest.Mocked<TasksRepository>;
    const projectAccess = {
      assertProjectInWorkspace: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProjectAccessService;

    // Dung service that thay vi mock: no chi la observer trong bo nho, va nho
    // vay test bat duoc ca truong hop quen phat su kien.
    publishedEvents = [];
    const handoverEvents = new HandoverEventsService();
    handoverEvents.onHandoverEvent((event) => {
      publishedEvents.push(event);
    });

    service = new ShiftHandoversService(
      repository,
      workspaceAccess,
      projectAccess,
      workspaceMembers,
      tasksRepository,
      handoverEvents,
    );
  });

  it('tạo bản nháp từ task đang được người giao phụ trách', async () => {
    repository.findOpenByTask.mockResolvedValue(null);
    repository.createHandover.mockResolvedValue(handover());

    const result = await service.createHandover(
      'sender-id',
      'workspace-id',
      'project-id',
      {
        taskId: 'task-id',
        receiverId: 'receiver-id',
        completedWork: 'Đã hoàn thiện API đăng nhập.',
        remainingWork: 'Cần bổ sung kiểm thử tích hợp.',
      },
    );

    expect(repository.createHandover).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'task-id',
        senderId: 'sender-id',
        receiverId: 'receiver-id',
        status: HandoverStatus.Draft,
      }),
    );
    expect(result.data.handover.taskId).toBe('task-id');
  });

  it('không cho người không phụ trách task tạo bàn giao', async () => {
    tasksRepository.findByIdAndProject.mockResolvedValue(
      task({ assigneeId: 'other-user-id' }),
    );

    await expect(
      service.createHandover('sender-id', 'workspace-id', 'project-id', {
        taskId: 'task-id',
        receiverId: 'receiver-id',
        completedWork: 'Đã làm một phần.',
        remainingWork: 'Còn một phần.',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('chỉ cho bàn giao task đang thực hiện hoặc đang duyệt', async () => {
    tasksRepository.findByIdAndProject.mockResolvedValue(
      task({ status: TaskStatus.Done }),
    );

    await expect(
      service.createHandover('sender-id', 'workspace-id', 'project-id', {
        taskId: 'task-id',
        receiverId: 'receiver-id',
        completedWork: 'Đã hoàn tất.',
        remainingWork: 'Không còn.',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('không tạo bàn giao mới khi task còn yêu cầu chưa hoàn tất', async () => {
    repository.findOpenByTask.mockResolvedValue(handover());

    await expect(
      service.createHandover('sender-id', 'workspace-id', 'project-id', {
        taskId: 'task-id',
        receiverId: 'receiver-id',
        completedWork: 'Đã làm một phần.',
        remainingWork: 'Còn một phần.',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('gửi bản nháp sang trạng thái chờ người nhận xác nhận', async () => {
    const draft = handover();
    const pending = handover({
      status: HandoverStatus.Pending,
      submittedAt: new Date(),
    });
    repository.findHandoverById
      .mockResolvedValueOnce(draft)
      .mockResolvedValueOnce(pending);
    repository.updateHandover.mockResolvedValue(pending);

    const result = await service.submitHandover(
      'sender-id',
      'workspace-id',
      'project-id',
      'handover-id',
    );

    expect(repository.updateHandover).toHaveBeenCalledWith(
      draft,
      expect.objectContaining({ status: HandoverStatus.Pending }),
    );
    expect(result.data.handover.status).toBe(HandoverStatus.Pending);
    // Phai phat su kien de nguoi nhan duoc gui mail thong bao.
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].type).toBe('submitted');
    expect(publishedEvents[0].handover.receiver.email).toBe(
      'receiver-id@example.com',
    );
  });

  it('người nhận có thể yêu cầu bổ sung thông tin', async () => {
    const pending = handover({ status: HandoverStatus.Pending });
    const changesRequested = handover({
      status: HandoverStatus.ChangesRequested,
      changeRequest: 'Bổ sung đường dẫn tài liệu.',
    });
    repository.findHandoverById
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(changesRequested);
    repository.updateHandover.mockResolvedValue(changesRequested);

    const result = await service.requestChanges(
      'receiver-id',
      'workspace-id',
      'project-id',
      'handover-id',
      'Bổ sung đường dẫn tài liệu.',
    );

    expect(result.data.handover.status).toBe(HandoverStatus.ChangesRequested);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].type).toBe('changes_requested');
    expect(publishedEvents[0].reason).toBe('Bổ sung đường dẫn tài liệu.');
  });

  it('người nhận có thể từ chối kèm lý do', async () => {
    const pending = handover({ status: HandoverStatus.Pending });
    const rejected = handover({
      status: HandoverStatus.Rejected,
      rejectionReason: 'Thông tin chưa đủ để tiếp nhận.',
    });
    repository.findHandoverById
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(rejected);
    repository.updateHandover.mockResolvedValue(rejected);

    const result = await service.reject(
      'receiver-id',
      'workspace-id',
      'project-id',
      'handover-id',
      'Thông tin chưa đủ để tiếp nhận.',
    );

    expect(result.data.handover.status).toBe(HandoverStatus.Rejected);
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].type).toBe('rejected');
    expect(publishedEvents[0].reason).toBe('Thông tin chưa đủ để tiếp nhận.');
  });

  it('chỉ đổi người phụ trách task khi người nhận chấp nhận', async () => {
    const pending = handover({ status: HandoverStatus.Pending });
    const accepted = handover({
      status: HandoverStatus.Acknowledged,
      acknowledgedAt: new Date(),
      task: task({ assigneeId: 'receiver-id' }),
    });
    repository.findHandoverById
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(accepted);
    repository.acceptAndTransferTask.mockResolvedValue(true);

    const result = await service.accept(
      'receiver-id',
      'workspace-id',
      'project-id',
      'handover-id',
    );

    expect(repository.acceptAndTransferTask).toHaveBeenCalledWith(pending);
    expect(result.data.handover.status).toBe(HandoverStatus.Acknowledged);
    expect(result.data.handover.task?.assigneeId).toBe('receiver-id');
    // Nguoi giao phai duoc thong bao la ban giao da duoc tiep nhan.
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].type).toBe('accepted');
    expect(publishedEvents[0].handover.sender.email).toBe(
      'sender-id@example.com',
    );
  });

  it('không chấp nhận nếu người phụ trách task đã thay đổi', async () => {
    repository.findHandoverById.mockResolvedValue(
      handover({ status: HandoverStatus.Pending }),
    );
    repository.acceptAndTransferTask.mockResolvedValue(false);

    await expect(
      service.accept(
        'receiver-id',
        'workspace-id',
        'project-id',
        'handover-id',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('cho phép người tạo xóa bản bàn giao', async () => {
    const draft = handover();
    repository.findHandoverById.mockResolvedValue(draft);

    await service.deleteHandover(
      'sender-id',
      'workspace-id',
      'project-id',
      'handover-id',
    );

    expect(repository.softDeleteHandover).toHaveBeenCalledWith(draft);
  });

  it('cho phép quản lý workspace xóa bản bàn giao', async () => {
    const draft = handover();
    repository.findHandoverById.mockResolvedValue(draft);
    workspaceAccess.getUserWorkspaceRole.mockResolvedValue(
      WorkspaceRole.ProjectManager,
    );

    await service.deleteHandover(
      'manager-id',
      'workspace-id',
      'project-id',
      'handover-id',
    );

    expect(repository.softDeleteHandover).toHaveBeenCalledWith(draft);
  });
});
