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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftHandoversRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const handover_status_enum_1 = require("../../../common/enums/handover-status.enum");
const task_entity_1 = require("../../tasks/entities/task.entity");
const shift_handover_entity_1 = require("../entities/shift-handover.entity");
let ShiftHandoversRepository = class ShiftHandoversRepository {
    handovers;
    dataSource;
    constructor(handovers, dataSource) {
        this.handovers = handovers;
        this.dataSource = dataSource;
    }
    async createHandover(data) {
        const handover = await this.handovers.save(this.handovers.create(data));
        return this.findHandoverById(handover.id, handover.projectId);
    }
    findHandoverById(handoverId, projectId) {
        return this.handovers.findOne({
            where: { id: handoverId, projectId },
            relations: { task: { assignee: true }, sender: true, receiver: true },
        });
    }
    findOpenByTask(taskId) {
        return this.handovers.findOne({
            where: {
                taskId,
                status: (0, typeorm_2.In)([
                    handover_status_enum_1.HandoverStatus.Draft,
                    handover_status_enum_1.HandoverStatus.Pending,
                    handover_status_enum_1.HandoverStatus.ChangesRequested,
                ]),
            },
        });
    }
    async findHandovers(projectId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const builder = this.handovers
            .createQueryBuilder('handover')
            .leftJoinAndSelect('handover.task', 'task')
            .leftJoinAndSelect('task.assignee', 'taskAssignee')
            .leftJoinAndSelect('handover.sender', 'sender')
            .leftJoinAndSelect('handover.receiver', 'receiver')
            .where('handover.projectId = :projectId', { projectId })
            .andWhere('handover.taskId IS NOT NULL')
            .andWhere('handover.deletedAt IS NULL');
        if (query.status) {
            builder.andWhere('handover.status = :status', { status: query.status });
        }
        if (query.memberId) {
            builder.andWhere(new typeorm_2.Brackets((where) => {
                where
                    .where('handover.senderId = :memberId', {
                    memberId: query.memberId,
                })
                    .orWhere('handover.receiverId = :memberId', {
                    memberId: query.memberId,
                });
            }));
        }
        if (query.taskId) {
            builder.andWhere('handover.taskId = :taskId', { taskId: query.taskId });
        }
        const [items, total] = await builder
            .orderBy('handover.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { items, total, page, limit };
    }
    findByProjectAndDate(projectId, reportDate) {
        return this.handovers
            .createQueryBuilder('handover')
            .leftJoinAndSelect('handover.task', 'task')
            .leftJoinAndSelect('handover.sender', 'sender')
            .leftJoinAndSelect('handover.receiver', 'receiver')
            .where('handover.projectId = :projectId', { projectId })
            .andWhere('handover.taskId IS NOT NULL')
            .andWhere('handover.deletedAt IS NULL')
            .andWhere('DATE(handover.createdAt) = :reportDate', { reportDate })
            .orderBy('handover.createdAt', 'DESC')
            .getMany();
    }
    findPendingByReceiver(receiverId, workspaceId) {
        const builder = this.handovers
            .createQueryBuilder('handover')
            .leftJoinAndSelect('handover.task', 'task')
            .leftJoinAndSelect('handover.sender', 'sender')
            .where('handover.receiverId = :receiverId', { receiverId })
            .andWhere('handover.taskId IS NOT NULL')
            .andWhere('handover.deletedAt IS NULL')
            .andWhere('handover.status IN (:...statuses)', {
            statuses: [handover_status_enum_1.HandoverStatus.Pending, handover_status_enum_1.HandoverStatus.ChangesRequested],
        });
        if (workspaceId) {
            builder.andWhere('handover.workspaceId = :workspaceId', { workspaceId });
        }
        return builder.orderBy('handover.createdAt', 'DESC').getMany();
    }
    updateHandover(handover, data) {
        Object.assign(handover, data);
        return this.handovers.save(handover);
    }
    softDeleteHandover(handover) {
        return this.handovers.softRemove(handover);
    }
    async acceptAndTransferTask(handover) {
        return this.dataSource.transaction(async (manager) => {
            const transfer = await manager
                .getRepository(task_entity_1.Task)
                .createQueryBuilder()
                .update(task_entity_1.Task)
                .set({ assigneeId: handover.receiverId })
                .where('id = :taskId', { taskId: handover.taskId })
                .andWhere('project_id = :projectId', { projectId: handover.projectId })
                .andWhere('assignee_id = :senderId', { senderId: handover.senderId })
                .andWhere('deleted_at IS NULL')
                .execute();
            if (transfer.affected !== 1)
                return false;
            await manager.getRepository(shift_handover_entity_1.ShiftHandover).update(handover.id, {
                status: handover_status_enum_1.HandoverStatus.Acknowledged,
                acknowledgedAt: new Date(),
                changeRequest: null,
                rejectionReason: null,
            });
            return true;
        });
    }
};
exports.ShiftHandoversRepository = ShiftHandoversRepository;
exports.ShiftHandoversRepository = ShiftHandoversRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shift_handover_entity_1.ShiftHandover)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ShiftHandoversRepository);
//# sourceMappingURL=shift-handovers.repository.js.map