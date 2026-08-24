import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { Task } from '../../tasks/entities/task.entity';
import { GetHandoversQueryDto } from '../dto/get-handovers-query.dto';
import { ShiftHandover } from '../entities/shift-handover.entity';

@Injectable()
export class ShiftHandoversRepository {
  constructor(
    @InjectRepository(ShiftHandover)
    private readonly handovers: Repository<ShiftHandover>,
    private readonly dataSource: DataSource,
  ) {}

  async createHandover(data: Partial<ShiftHandover>) {
    const handover = await this.handovers.save(this.handovers.create(data));
    return this.findHandoverById(handover.id, handover.projectId);
  }

  findHandoverById(handoverId: string, projectId: string) {
    return this.handovers.findOne({
      where: { id: handoverId, projectId },
      relations: { task: { assignee: true }, sender: true, receiver: true },
    });
  }

  findOpenByTask(taskId: string) {
    return this.handovers.findOne({
      where: {
        taskId,
        status: In([
          HandoverStatus.Draft,
          HandoverStatus.Pending,
          HandoverStatus.ChangesRequested,
        ]),
      },
    });
  }

  async findHandovers(projectId: string, query: GetHandoversQueryDto) {
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
      builder.andWhere(
        new Brackets((where) => {
          where
            .where('handover.senderId = :memberId', {
              memberId: query.memberId,
            })
            .orWhere('handover.receiverId = :memberId', {
              memberId: query.memberId,
            });
        }),
      );
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

  /**
   * Lay cac ban giao phat sinh trong mot ngay cua project.
   * Dung cho bao cao giao ban AI: AI can biet cong viec da chuyen tay cho ai,
   * neu khong bao cao se noi sai ve tien do va nguoi phu trach.
   * Loc theo created_at thay vi updated_at de moc thoi gian on dinh.
   */
  findByProjectAndDate(projectId: string, reportDate: string) {
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

  /**
   * Cac ban giao dang cho mot nguoi xu ly, trong toan bo workspace.
   * PENDING va CHANGES_REQUESTED deu can nguoi nhan hanh dong,
   * DRAFT thi khong vi nguoi gui chua bam gui.
   */
  findPendingByReceiver(receiverId: string, workspaceId?: string) {
    const builder = this.handovers
      .createQueryBuilder('handover')
      .leftJoinAndSelect('handover.task', 'task')
      .leftJoinAndSelect('handover.sender', 'sender')
      .where('handover.receiverId = :receiverId', { receiverId })
      .andWhere('handover.taskId IS NOT NULL')
      .andWhere('handover.deletedAt IS NULL')
      .andWhere('handover.status IN (:...statuses)', {
        statuses: [HandoverStatus.Pending, HandoverStatus.ChangesRequested],
      });

    if (workspaceId) {
      builder.andWhere('handover.workspaceId = :workspaceId', { workspaceId });
    }

    return builder.orderBy('handover.createdAt', 'DESC').getMany();
  }

  updateHandover(handover: ShiftHandover, data: Partial<ShiftHandover>) {
    Object.assign(handover, data);
    return this.handovers.save(handover);
  }

  softDeleteHandover(handover: ShiftHandover) {
    return this.handovers.softRemove(handover);
  }

  async acceptAndTransferTask(handover: ShiftHandover) {
    return this.dataSource.transaction(async (manager) => {
      const transfer = await manager
        .getRepository(Task)
        .createQueryBuilder()
        .update(Task)
        .set({ assigneeId: handover.receiverId })
        .where('id = :taskId', { taskId: handover.taskId })
        .andWhere('project_id = :projectId', { projectId: handover.projectId })
        .andWhere('assignee_id = :senderId', { senderId: handover.senderId })
        .andWhere('deleted_at IS NULL')
        .execute();

      if (transfer.affected !== 1) return false;

      await manager.getRepository(ShiftHandover).update(handover.id, {
        status: HandoverStatus.Acknowledged,
        acknowledgedAt: new Date(),
        changeRequest: null,
        rejectionReason: null,
      });
      return true;
    });
  }
}
