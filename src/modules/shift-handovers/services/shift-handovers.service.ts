import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { Task } from '../../tasks/entities/task.entity';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateHandoverDto } from '../dto/create-handover.dto';
import { GetHandoversQueryDto } from '../dto/get-handovers-query.dto';
import { UpdateHandoverDto } from '../dto/update-handover.dto';
import { ShiftHandover } from '../entities/shift-handover.entity';
import { ShiftHandoversRepository } from '../repositories/shift-handovers.repository';
import { HandoverEventsService } from './handover-events.service';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

const transferableStatuses = [TaskStatus.InProgress, TaskStatus.Review];

@Injectable()
export class ShiftHandoversService {
  constructor(
    private readonly repository: ShiftHandoversRepository,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly projectAccess: ProjectAccessService,
    private readonly workspaceMembers: WorkspaceMembersRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly handoverEvents: HandoverEventsService,
  ) {}

  async createHandover(
    userId: string,
    workspaceId: string,
    projectId: string,
    dto: CreateHandoverDto,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const task = await this.getTask(dto.taskId, projectId);
    this.assertTaskCanBeHandedOver(task, userId);

    if (dto.receiverId === userId) {
      throw new BadRequestException('Người nhận phải khác người đang phụ trách task');
    }
    await this.assertActiveMember(workspaceId, dto.receiverId);

    if (await this.repository.findOpenByTask(task.id)) {
      throw new ConflictException('Task này đang có một yêu cầu bàn giao chưa hoàn tất');
    }

    const handover = await this.repository.createHandover({
      workspaceId,
      projectId,
      taskId: task.id,
      senderId: userId,
      receiverId: dto.receiverId,
      title: `${task.taskCode} - ${task.title}`,
      summary: null,
      completedWork: dto.completedWork.trim(),
      remainingWork: dto.remainingWork.trim(),
      blockers: this.optionalText(dto.blockers),
      nextSteps: this.optionalText(dto.nextSteps),
      referenceLinks: this.optionalText(dto.referenceLinks),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      status: HandoverStatus.Draft,
      changeRequest: null,
      rejectionReason: null,
      submittedAt: null,
      acknowledgedAt: null,
      rejectedAt: null,
    });

    return this.response('Đã tạo bản nháp bàn giao công việc', {
      handover: this.mapHandover(handover!),
    });
  }

  async getHandovers(
    userId: string,
    workspaceId: string,
    projectId: string,
    query: GetHandoversQueryDto,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const result = await this.repository.findHandovers(projectId, query);
    return this.response('Lấy danh sách bàn giao công việc thành công', {
      items: result.items.map((handover) => this.mapHandover(handover)),
      meta: { total: result.total, page: result.page, limit: result.limit },
    });
  }

  async getHandover(
    userId: string,
    workspaceId: string,
    projectId: string,
    handoverId: string,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const handover = await this.getHandoverEntity(handoverId, projectId);
    return this.response('Lấy chi tiết bàn giao công việc thành công', {
      handover: this.mapHandover(handover),
    });
  }

  async updateHandover(
    userId: string,
    workspaceId: string,
    projectId: string,
    handoverId: string,
    dto: UpdateHandoverDto,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const handover = await this.getHandoverEntity(handoverId, projectId);
    this.assertSenderCanEdit(userId, handover);

    if (dto.receiverId) {
      if (dto.receiverId === userId) {
        throw new BadRequestException('Người nhận phải khác người đang phụ trách task');
      }
      await this.assertActiveMember(workspaceId, dto.receiverId);
    }

    const updated = await this.repository.updateHandover(handover, {
      receiverId: dto.receiverId ?? handover.receiverId,
      completedWork: dto.completedWork?.trim() ?? handover.completedWork,
      remainingWork: dto.remainingWork?.trim() ?? handover.remainingWork,
      blockers: dto.blockers === undefined ? handover.blockers : this.optionalText(dto.blockers),
      nextSteps: dto.nextSteps === undefined ? handover.nextSteps : this.optionalText(dto.nextSteps),
      referenceLinks:
        dto.referenceLinks === undefined
          ? handover.referenceLinks
          : this.optionalText(dto.referenceLinks),
      dueAt: dto.dueAt === undefined ? handover.dueAt : dto.dueAt ? new Date(dto.dueAt) : null,
      status: HandoverStatus.Draft,
      changeRequest: null,
      rejectionReason: null,
      rejectedAt: null,
    });

    return this.response('Cập nhật bàn giao công việc thành công', {
      handover: this.mapHandover(
        (await this.repository.findHandoverById(updated.id, projectId))!,
      ),
    });
  }

  async submitHandover(
    userId: string,
    workspaceId: string,
    projectId: string,
    handoverId: string,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const handover = await this.getHandoverEntity(handoverId, projectId);
    this.assertSenderCanEdit(userId, handover);
    const task = await this.getTask(handover.taskId!, projectId);
    this.assertTaskCanBeHandedOver(task, userId);

    if (!handover.completedWork?.trim() || !handover.remainingWork?.trim()) {
      throw new BadRequestException('Cần nhập phần đã làm và phần còn lại trước khi gửi');
    }

    await this.repository.updateHandover(handover, {
      status: HandoverStatus.Pending,
      submittedAt: new Date(),
      changeRequest: null,
      rejectionReason: null,
    });

    // Nạp lại để có sender/receiver/task cho email, rồi mới phát sự kiện.
    const submitted = await this.getHandoverEntity(handover.id, projectId);
    this.handoverEvents.publish({ type: 'submitted', handover: submitted });

    return this.response('Đã gửi yêu cầu bàn giao cho người nhận', {
      handover: this.mapHandover(submitted),
    });
  }

  async requestChanges(
    userId: string,
    workspaceId: string,
    projectId: string,
    handoverId: string,
    reason: string,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const handover = await this.getHandoverEntity(handoverId, projectId);
    this.assertReceiverPending(userId, handover);
    await this.repository.updateHandover(handover, {
      status: HandoverStatus.ChangesRequested,
      changeRequest: reason.trim(),
    });
    const updated = await this.getHandoverEntity(handover.id, projectId);
    this.handoverEvents.publish({
      type: 'changes_requested',
      handover: updated,
      reason,
    });

    return this.response('Đã yêu cầu người giao bổ sung thông tin', {
      handover: this.mapHandover(updated),
    });
  }

  async reject(
    userId: string,
    workspaceId: string,
    projectId: string,
    handoverId: string,
    reason: string,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const handover = await this.getHandoverEntity(handoverId, projectId);
    this.assertReceiverPending(userId, handover);
    await this.repository.updateHandover(handover, {
      status: HandoverStatus.Rejected,
      rejectionReason: reason.trim(),
      rejectedAt: new Date(),
    });
    const rejected = await this.getHandoverEntity(handover.id, projectId);
    this.handoverEvents.publish({
      type: 'rejected',
      handover: rejected,
      reason,
    });

    return this.response('Đã từ chối nhận bàn giao', {
      handover: this.mapHandover(rejected),
    });
  }

  async accept(
    userId: string,
    workspaceId: string,
    projectId: string,
    handoverId: string,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const handover = await this.getHandoverEntity(handoverId, projectId);
    this.assertReceiverPending(userId, handover);
    const task = await this.getTask(handover.taskId!, projectId);
    this.assertTaskCanBeHandedOver(task, handover.senderId);

    if (!(await this.repository.acceptAndTransferTask(handover))) {
      throw new ConflictException(
        'Người phụ trách task đã thay đổi. Hãy tải lại trước khi chấp nhận bàn giao',
      );
    }

    const accepted = await this.getHandoverEntity(handover.id, projectId);
    this.handoverEvents.publish({ type: 'accepted', handover: accepted });

    return this.response('Đã nhận bàn giao và chuyển người phụ trách task', {
      handover: this.mapHandover(accepted),
    });
  }

  async deleteHandover(
    userId: string,
    workspaceId: string,
    projectId: string,
    handoverId: string,
  ) {
    await this.assertContext(userId, workspaceId, projectId);
    const handover = await this.getHandoverEntity(handoverId, projectId);
    await this.assertCreatorOrManager(userId, workspaceId, handover.senderId);
    await this.repository.softDeleteHandover(handover);
    return this.response('Xóa bàn giao công việc thành công', null);
  }

  private async assertContext(userId: string, workspaceId: string, projectId: string) {
    await this.workspaceAccess.assertWorkspaceActive(workspaceId);
    await this.workspaceAccess.assertWorkspaceMember(userId, workspaceId);
    await this.projectAccess.assertProjectInWorkspace(projectId, workspaceId);
  }

  private async assertActiveMember(workspaceId: string, userId: string) {
    const member = await this.workspaceMembers.findActiveByWorkspaceAndUser(workspaceId, userId);
    if (!member) {
      throw new BadRequestException('Người nhận không phải thành viên đang hoạt động của workspace');
    }
  }

  private async assertCreatorOrManager(userId: string, workspaceId: string, creatorId: string) {
    if (userId === creatorId) return;
    const role = await this.workspaceAccess.getUserWorkspaceRole(userId, workspaceId);
    if (!role || !managerRoles.includes(role)) {
      throw new ForbiddenException('Bạn không có quyền xóa bản bàn giao này');
    }
  }

  private assertTaskCanBeHandedOver(task: Task, senderId: string) {
    if (task.assigneeId !== senderId) {
      throw new ForbiddenException('Chỉ người đang phụ trách task mới được bàn giao');
    }
    if (!transferableStatuses.includes(task.status)) {
      throw new BadRequestException('Chỉ task đang thực hiện hoặc đang review mới được bàn giao');
    }
  }

  private async getTask(taskId: string, projectId: string) {
    const task = await this.tasksRepository.findByIdAndProject(taskId, projectId);
    if (!task) throw new NotFoundException('Không tìm thấy task trong project');
    return task;
  }

  private async getHandoverEntity(handoverId: string, projectId: string) {
    const handover = await this.repository.findHandoverById(handoverId, projectId);
    if (!handover?.taskId) throw new NotFoundException('Không tìm thấy bản bàn giao công việc');
    return handover;
  }

  private assertSenderCanEdit(userId: string, handover: ShiftHandover) {
    if (handover.senderId !== userId) {
      throw new ForbiddenException('Chỉ người giao công việc được chỉnh sửa bản bàn giao');
    }
    if (![HandoverStatus.Draft, HandoverStatus.ChangesRequested].includes(handover.status)) {
      throw new BadRequestException('Bản bàn giao hiện không thể chỉnh sửa');
    }
  }

  private assertReceiverPending(userId: string, handover: ShiftHandover) {
    if (handover.receiverId !== userId) {
      throw new ForbiddenException('Chỉ người nhận được thực hiện thao tác này');
    }
    if (handover.status !== HandoverStatus.Pending) {
      throw new BadRequestException('Bản bàn giao không ở trạng thái chờ xác nhận');
    }
  }

  private optionalText(value?: string | null) {
    const text = value?.trim();
    return text || null;
  }

  private mapUser(user?: { id: string; fullName: string; email: string; avatarUrl: string | null } | null) {
    return user
      ? { id: user.id, fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl }
      : null;
  }

  private mapHandover(handover: ShiftHandover) {
    return {
      id: handover.id,
      workspaceId: handover.workspaceId,
      projectId: handover.projectId,
      taskId: handover.taskId,
      task: handover.task
        ? {
            id: handover.task.id,
            taskCode: handover.task.taskCode,
            title: handover.task.title,
            status: handover.task.status,
            assigneeId: handover.task.assigneeId,
            assignee: this.mapUser(handover.task.assignee),
          }
        : null,
      senderId: handover.senderId,
      receiverId: handover.receiverId,
      sender: this.mapUser(handover.sender),
      receiver: this.mapUser(handover.receiver),
      title: handover.title,
      completedWork: handover.completedWork,
      remainingWork: handover.remainingWork,
      blockers: handover.blockers,
      nextSteps: handover.nextSteps,
      referenceLinks: handover.referenceLinks,
      dueAt: handover.dueAt,
      status: handover.status,
      changeRequest: handover.changeRequest,
      rejectionReason: handover.rejectionReason,
      submittedAt: handover.submittedAt,
      acceptedAt: handover.acknowledgedAt,
      rejectedAt: handover.rejectedAt,
      createdAt: handover.createdAt,
      updatedAt: handover.updatedAt,
    };
  }

  private response<T>(message: string, data: T) {
    return { success: true, message, data };
  }
}
