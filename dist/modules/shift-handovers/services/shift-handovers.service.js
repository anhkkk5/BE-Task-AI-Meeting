"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftHandoversService = void 0;
const common_1 = require("@nestjs/common");
const handover_status_enum_1 = require("../../../common/enums/handover-status.enum");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const project_access_service_1 = require("../../projects/services/project-access.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const shift_handovers_repository_1 = require("../repositories/shift-handovers.repository");
const handover_events_service_1 = require("./handover-events.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
const transferableStatuses = [task_status_enum_1.TaskStatus.InProgress, task_status_enum_1.TaskStatus.Review];
let ShiftHandoversService = class ShiftHandoversService {
    repository;
    workspaceAccess;
    projectAccess;
    workspaceMembers;
    tasksRepository;
    handoverEvents;
    constructor(repository, workspaceAccess, projectAccess, workspaceMembers, tasksRepository, handoverEvents) {
        this.repository = repository;
        this.workspaceAccess = workspaceAccess;
        this.projectAccess = projectAccess;
        this.workspaceMembers = workspaceMembers;
        this.tasksRepository = tasksRepository;
        this.handoverEvents = handoverEvents;
    }
    async createHandover(userId, workspaceId, projectId, dto) {
        await this.assertContext(userId, workspaceId, projectId);
        const task = await this.getTask(dto.taskId, projectId);
        this.assertTaskCanBeHandedOver(task, userId);
        if (dto.receiverId === userId) {
            throw new common_1.BadRequestException('Người nhận phải khác người đang phụ trách task');
        }
        await this.assertActiveMember(workspaceId, dto.receiverId);
        if (await this.repository.findOpenByTask(task.id)) {
            throw new common_1.ConflictException('Task này đang có một yêu cầu bàn giao chưa hoàn tất');
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
            status: handover_status_enum_1.HandoverStatus.Draft,
            changeRequest: null,
            rejectionReason: null,
            submittedAt: null,
            acknowledgedAt: null,
            rejectedAt: null,
        });
        return this.response('Đã tạo bản nháp bàn giao công việc', {
            handover: this.mapHandover(handover),
        });
    }
    async getHandovers(userId, workspaceId, projectId, query) {
        await this.assertContext(userId, workspaceId, projectId);
        const result = await this.repository.findHandovers(projectId, query);
        return this.response('Lấy danh sách bàn giao công việc thành công', {
            items: result.items.map((handover) => this.mapHandover(handover)),
            meta: { total: result.total, page: result.page, limit: result.limit },
        });
    }
    async getHandover(userId, workspaceId, projectId, handoverId) {
        await this.assertContext(userId, workspaceId, projectId);
        const handover = await this.getHandoverEntity(handoverId, projectId);
        return this.response('Lấy chi tiết bàn giao công việc thành công', {
            handover: this.mapHandover(handover),
        });
    }
    async updateHandover(userId, workspaceId, projectId, handoverId, dto) {
        await this.assertContext(userId, workspaceId, projectId);
        const handover = await this.getHandoverEntity(handoverId, projectId);
        this.assertSenderCanEdit(userId, handover);
        if (dto.receiverId) {
            if (dto.receiverId === userId) {
                throw new common_1.BadRequestException('Người nhận phải khác người đang phụ trách task');
            }
            await this.assertActiveMember(workspaceId, dto.receiverId);
        }
        const updated = await this.repository.updateHandover(handover, {
            receiverId: dto.receiverId ?? handover.receiverId,
            completedWork: dto.completedWork?.trim() ?? handover.completedWork,
            remainingWork: dto.remainingWork?.trim() ?? handover.remainingWork,
            blockers: dto.blockers === undefined ? handover.blockers : this.optionalText(dto.blockers),
            nextSteps: dto.nextSteps === undefined ? handover.nextSteps : this.optionalText(dto.nextSteps),
            referenceLinks: dto.referenceLinks === undefined
                ? handover.referenceLinks
                : this.optionalText(dto.referenceLinks),
            dueAt: dto.dueAt === undefined ? handover.dueAt : dto.dueAt ? new Date(dto.dueAt) : null,
            status: handover_status_enum_1.HandoverStatus.Draft,
            changeRequest: null,
            rejectionReason: null,
            rejectedAt: null,
        });
        return this.response('Cập nhật bàn giao công việc thành công', {
            handover: this.mapHandover((await this.repository.findHandoverById(updated.id, projectId))),
        });
    }
    async submitHandover(userId, workspaceId, projectId, handoverId) {
        await this.assertContext(userId, workspaceId, projectId);
        const handover = await this.getHandoverEntity(handoverId, projectId);
        this.assertSenderCanEdit(userId, handover);
        const task = await this.getTask(handover.taskId, projectId);
        this.assertTaskCanBeHandedOver(task, userId);
        if (!handover.completedWork?.trim() || !handover.remainingWork?.trim()) {
            throw new common_1.BadRequestException('Cần nhập phần đã làm và phần còn lại trước khi gửi');
        }
        await this.repository.updateHandover(handover, {
            status: handover_status_enum_1.HandoverStatus.Pending,
            submittedAt: new Date(),
            changeRequest: null,
            rejectionReason: null,
        });
        const submitted = await this.getHandoverEntity(handover.id, projectId);
        this.handoverEvents.publish({ type: 'submitted', handover: submitted });
        return this.response('Đã gửi yêu cầu bàn giao cho người nhận', {
            handover: this.mapHandover(submitted),
        });
    }
    async requestChanges(userId, workspaceId, projectId, handoverId, reason) {
        await this.assertContext(userId, workspaceId, projectId);
        const handover = await this.getHandoverEntity(handoverId, projectId);
        this.assertReceiverPending(userId, handover);
        await this.repository.updateHandover(handover, {
            status: handover_status_enum_1.HandoverStatus.ChangesRequested,
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
    async reject(userId, workspaceId, projectId, handoverId, reason) {
        await this.assertContext(userId, workspaceId, projectId);
        const handover = await this.getHandoverEntity(handoverId, projectId);
        this.assertReceiverPending(userId, handover);
        await this.repository.updateHandover(handover, {
            status: handover_status_enum_1.HandoverStatus.Rejected,
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
    async accept(userId, workspaceId, projectId, handoverId) {
        await this.assertContext(userId, workspaceId, projectId);
        const handover = await this.getHandoverEntity(handoverId, projectId);
        this.assertReceiverPending(userId, handover);
        const task = await this.getTask(handover.taskId, projectId);
        this.assertTaskCanBeHandedOver(task, handover.senderId);
        if (!(await this.repository.acceptAndTransferTask(handover))) {
            throw new common_1.ConflictException('Người phụ trách task đã thay đổi. Hãy tải lại trước khi chấp nhận bàn giao');
        }
        const accepted = await this.getHandoverEntity(handover.id, projectId);
        this.handoverEvents.publish({ type: 'accepted', handover: accepted });
        return this.response('Đã nhận bàn giao và chuyển người phụ trách task', {
            handover: this.mapHandover(accepted),
        });
    }
    async deleteHandover(userId, workspaceId, projectId, handoverId) {
        await this.assertContext(userId, workspaceId, projectId);
        const handover = await this.getHandoverEntity(handoverId, projectId);
        await this.assertCreatorOrManager(userId, workspaceId, handover.senderId);
        await this.repository.softDeleteHandover(handover);
        return this.response('Xóa bàn giao công việc thành công', null);
    }
    async assertContext(userId, workspaceId, projectId) {
        await this.workspaceAccess.assertWorkspaceActive(workspaceId);
        await this.workspaceAccess.assertWorkspaceMember(userId, workspaceId);
        await this.projectAccess.assertProjectInWorkspace(projectId, workspaceId);
    }
    async assertActiveMember(workspaceId, userId) {
        const member = await this.workspaceMembers.findActiveByWorkspaceAndUser(workspaceId, userId);
        if (!member) {
            throw new common_1.BadRequestException('Người nhận không phải thành viên đang hoạt động của workspace');
        }
    }
    async assertCreatorOrManager(userId, workspaceId, creatorId) {
        if (userId === creatorId)
            return;
        const role = await this.workspaceAccess.getUserWorkspaceRole(userId, workspaceId);
        if (!role || !managerRoles.includes(role)) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa bản bàn giao này');
        }
    }
    assertTaskCanBeHandedOver(task, senderId) {
        if (task.assigneeId !== senderId) {
            throw new common_1.ForbiddenException('Chỉ người đang phụ trách task mới được bàn giao');
        }
        if (!transferableStatuses.includes(task.status)) {
            throw new common_1.BadRequestException('Chỉ task đang thực hiện hoặc đang review mới được bàn giao');
        }
    }
    async getTask(taskId, projectId) {
        const task = await this.tasksRepository.findByIdAndProject(taskId, projectId);
        if (!task)
            throw new common_1.NotFoundException('Không tìm thấy task trong project');
        return task;
    }
    async getHandoverEntity(handoverId, projectId) {
        const handover = await this.repository.findHandoverById(handoverId, projectId);
        if (!handover?.taskId)
            throw new common_1.NotFoundException('Không tìm thấy bản bàn giao công việc');
        return handover;
    }
    assertSenderCanEdit(userId, handover) {
        if (handover.senderId !== userId) {
            throw new common_1.ForbiddenException('Chỉ người giao công việc được chỉnh sửa bản bàn giao');
        }
        if (![handover_status_enum_1.HandoverStatus.Draft, handover_status_enum_1.HandoverStatus.ChangesRequested].includes(handover.status)) {
            throw new common_1.BadRequestException('Bản bàn giao hiện không thể chỉnh sửa');
        }
    }
    assertReceiverPending(userId, handover) {
        if (handover.receiverId !== userId) {
            throw new common_1.ForbiddenException('Chỉ người nhận được thực hiện thao tác này');
        }
        if (handover.status !== handover_status_enum_1.HandoverStatus.Pending) {
            throw new common_1.BadRequestException('Bản bàn giao không ở trạng thái chờ xác nhận');
        }
    }
    optionalText(value) {
        const text = value?.trim();
        return text || null;
    }
    mapUser(user) {
        return user
            ? { id: user.id, fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl }
            : null;
    }
    mapHandover(handover) {
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
    response(message, data) {
        return { success: true, message, data };
    }
};
exports.ShiftHandoversService = ShiftHandoversService;
exports.ShiftHandoversService = ShiftHandoversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [shift_handovers_repository_1.ShiftHandoversRepository,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService,
        workspace_members_repository_1.WorkspaceMembersRepository,
        tasks_repository_1.TasksRepository,
        handover_events_service_1.HandoverEventsService])
], ShiftHandoversService);
//# sourceMappingURL=shift-handovers.service.js.map