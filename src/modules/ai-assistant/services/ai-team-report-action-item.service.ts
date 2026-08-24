import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AiReportReviewStatus,
  normalizeReviewStatus,
} from '../../../common/enums/ai-report-review-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import {
  TeamReportActionItemSource,
  TeamReportActionItemStatus,
} from '../../../common/enums/team-report-action-item-status.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { TasksService } from '../../tasks/services/tasks.service';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { CreateTeamReportTaskDto } from '../dto/create-team-report-task.dto';
import { DismissTeamReportActionItemDto } from '../dto/dismiss-team-report-action-item.dto';
import { RequestTeamReportHandoverDto } from '../dto/request-team-report-handover.dto';
import { TeamReportActionItem } from '../entities/team-report-action-item.entity';
import { TeamReportActionItemsRepository } from '../repositories/team-report-action-items.repository';
import {
  AiReport,
  AiReportDocument,
  TeamDailyReportOutput,
} from '../schemas/ai-report.schema';
import { AiReportAccessService } from './ai-report-access.service';

/**
 * Chot viec sau buoi giao ban.
 *
 * Bao cao giao ban neu ra vuong mac va de xuat, nhung neu khong ai chot lai thi
 * chung chi la chu tren bao cao. Service nay bien tung muc thanh task hoac de
 * nghi ban giao, va ghi lai da xu ly de mo lai bao cao cu khong tao trung.
 */
@Injectable()
export class AiTeamReportActionItemService {
  constructor(
    @Optional()
    @InjectModel(AiReport.name)
    private readonly aiReportModel: Model<AiReportDocument> | null,
    private readonly actionItemsRepository: TeamReportActionItemsRepository,
    private readonly aiReportAccessService: AiReportAccessService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly tasksService: TasksService,
    private readonly tasksRepository: TasksRepository,
    private readonly workspaceMembers: WorkspaceMembersRepository,
  ) {}

  /**
   * Liet ke vuong mac va de xuat cua mot phien giao ban kem trang thai xu ly.
   *
   * Gop hai danh sach thanh mot de frontend hien mot bang duy nhat; truong
   * `source` de phan biet khi can loc.
   */
  async getActionItems(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    const { report, canManage } = await this.findReportForRead(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
    );
    const records = await this.actionItemsRepository.findByReport(reportId);
    const recordsByKey = new Map(
      records.map((record) => [
        this.buildKey(record.source, record.itemIndex),
        record,
      ]),
    );
    const output = report.aiOutput as TeamDailyReportOutput;

    return {
      success: true,
      message: 'Lay danh sach de xuat tu bao cao giao ban thanh cong',
      data: {
        items: [
          ...this.collectItems(
            output.blockers ?? [],
            TeamReportActionItemSource.Blocker,
            recordsByKey,
          ),
          ...this.collectItems(
            output.recommendations ?? [],
            TeamReportActionItemSource.Recommendation,
            recordsByKey,
          ),
        ],
        // Thanh vien thuong doc duoc danh sach nhung khong chot duoc, co nay de
        // frontend an cac nut thao tac thay vi de nguoi dung bam roi nhan 403.
        canHandle: canManage,
      },
    };
  }

  /** Tao task tu mot muc de xuat va ghi lai de khong tao trung lan hai. */
  async createTaskFromActionItem(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
    dto: CreateTeamReportTaskDto,
  ) {
    const { report, itemText } = await this.findPendingItem(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
      dto.source,
      dto.itemIndex,
    );
    const taskResult = await this.tasksService.createTask(
      currentUserId,
      workspaceId,
      projectId,
      {
        title: dto.title?.trim() || this.buildTaskTitle(itemText),
        description: this.buildTaskDescription(itemText, report.reportDate),
        assigneeId: dto.assigneeId,
        sprintId: dto.sprintId,
        dueDate: dto.dueDate,
      },
    );
    const task = taskResult.data.task;
    const record = await this.actionItemsRepository.save({
      workspaceId,
      projectId,
      reportId,
      source: dto.source,
      itemIndex: dto.itemIndex,
      itemText,
      status: TeamReportActionItemStatus.TaskCreated,
      createdTaskId: task.id,
      targetTaskId: null,
      suggestedReceiverId: null,
      handoverId: null,
      note: null,
      handledBy: currentUserId,
      handledAt: new Date(),
    });

    return {
      success: true,
      message: 'Da tao task tu de xuat cua bao cao giao ban',
      data: {
        item: this.toItemResponse(dto.itemIndex, itemText, dto.source, record),
        task,
      },
    };
  }

  /**
   * Ghi nhan de nghi ban giao mot task.
   *
   * Khong tao thang ban ghi ban giao: chi nguoi dang giu task moi duoc mo ban
   * giao, nen day chi la loi nhan de nguoi do tu xac nhan.
   */
  async requestHandoverFromActionItem(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
    dto: RequestTeamReportHandoverDto,
  ) {
    const { itemText } = await this.findPendingItem(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
      dto.source,
      dto.itemIndex,
    );
    const task = await this.tasksRepository.findByIdAndProject(
      dto.taskId,
      projectId,
    );

    if (!task) {
      throw new NotFoundException('Khong tim thay task trong du an');
    }

    if (!task.assigneeId) {
      throw new BadRequestException(
        'Task chua co nguoi phu trach nen chua the de nghi ban giao',
      );
    }

    if (task.assigneeId === dto.suggestedReceiverId) {
      throw new BadRequestException(
        'Nguoi nhan de xuat phai khac nguoi dang phu trach task',
      );
    }

    await this.assertActiveMember(workspaceId, dto.suggestedReceiverId);

    const record = await this.actionItemsRepository.save({
      workspaceId,
      projectId,
      reportId,
      source: dto.source,
      itemIndex: dto.itemIndex,
      itemText,
      status: TeamReportActionItemStatus.HandoverRequested,
      createdTaskId: null,
      targetTaskId: task.id,
      suggestedReceiverId: dto.suggestedReceiverId,
      handoverId: null,
      note: dto.note?.trim() || null,
      handledBy: currentUserId,
      handledAt: new Date(),
    });

    return {
      success: true,
      message: 'Da gui de nghi ban giao cho nguoi dang phu trach task',
      data: {
        item: this.toItemResponse(dto.itemIndex, itemText, dto.source, record),
      },
    };
  }

  /** Bo qua mot muc de xuat, kem ly do de lan sau doc lai con hieu. */
  async dismissActionItem(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
    source: TeamReportActionItemSource,
    itemIndex: number,
    dto: DismissTeamReportActionItemDto,
  ) {
    const { itemText } = await this.findPendingItem(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
      source,
      itemIndex,
    );
    const record = await this.actionItemsRepository.save({
      workspaceId,
      projectId,
      reportId,
      source,
      itemIndex,
      itemText,
      status: TeamReportActionItemStatus.Dismissed,
      createdTaskId: null,
      targetTaskId: null,
      suggestedReceiverId: null,
      handoverId: null,
      note: dto.reason?.trim() || null,
      handledBy: currentUserId,
      handledAt: new Date(),
    });

    return {
      success: true,
      message: 'Da bo qua de xuat nay',
      data: {
        item: this.toItemResponse(itemIndex, itemText, source, record),
      },
    };
  }

  private async findPendingItem(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
    source: TeamReportActionItemSource,
    itemIndex: number,
  ) {
    const report = await this.findReportOrFail(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
    );
    const itemText = this.getItemText(report, source, itemIndex);
    const existing = await this.actionItemsRepository.findOne(
      reportId,
      source,
      itemIndex,
    );

    if (existing && existing.status !== TeamReportActionItemStatus.Pending) {
      throw new ConflictException(this.buildConflictMessage(existing.status));
    }

    return { report, itemText };
  }

  private buildConflictMessage(status: TeamReportActionItemStatus) {
    if (status === TeamReportActionItemStatus.TaskCreated) {
      return 'De xuat nay da duoc tao thanh task';
    }

    if (status === TeamReportActionItemStatus.HandoverRequested) {
      return 'De xuat nay da co de nghi ban giao';
    }

    return 'De xuat nay da bi bo qua';
  }

  private async findReportOrFail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    await this.aiReportAccessService.assertCanUseTeamReports(
      currentUserId,
      workspaceId,
    );

    return this.loadReport(workspaceId, projectId, reportId);
  }

  /**
   * Lay bao cao cho muc dich chi doc.
   *
   * Thanh vien thuong nhan mail bao cao da duyet nen phai xem duoc phan vuong
   * mac va de xuat. Ban chua phat hanh van kin de nhom khong doc nham noi dung
   * chua chot.
   */
  private async findReportForRead(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    const role = await this.aiReportAccessService.assertCanViewTeamReport(
      currentUserId,
      workspaceId,
    );
    const canManage = this.aiReportAccessService.isManagerRole(role);
    const report = await this.loadReport(workspaceId, projectId, reportId);

    if (
      !canManage &&
      normalizeReviewStatus(report.reviewStatus) !==
        AiReportReviewStatus.Published
    ) {
      throw new ForbiddenException(
        'Báo cáo giao ban này chưa được phát hành cho cả nhóm',
      );
    }

    return { report, canManage };
  }

  private async loadReport(
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    const reportModel = this.getReportModel();
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );

    const report = await reportModel.findById(reportId).exec();

    if (
      !report ||
      report.workspaceId !== workspaceId ||
      report.projectId !== projectId ||
      report.reportType !== AiReportType.TeamDailyReport
    ) {
      throw new NotFoundException(
        'Khong tim thay bao cao giao ban trong du an',
      );
    }

    return report;
  }

  private getItemText(
    report: AiReportDocument,
    source: TeamReportActionItemSource,
    itemIndex: number,
  ) {
    if (!Number.isInteger(itemIndex) || itemIndex < 0) {
      throw new BadRequestException('Vi tri de xuat khong hop le');
    }

    const output = report.aiOutput as TeamDailyReportOutput;
    const list =
      source === TeamReportActionItemSource.Blocker
        ? (output.blockers ?? [])
        : (output.recommendations ?? []);
    const itemText = list[itemIndex];

    if (!itemText) {
      throw new NotFoundException('Khong tim thay de xuat trong bao cao');
    }

    return itemText;
  }

  private async assertActiveMember(workspaceId: string, userId: string) {
    const member = await this.workspaceMembers.findActiveByWorkspaceAndUser(
      workspaceId,
      userId,
    );

    if (!member) {
      throw new BadRequestException(
        'Nguoi nhan de xuat khong phai thanh vien dang hoat dong cua workspace',
      );
    }

    return member;
  }

  private collectItems(
    texts: string[],
    source: TeamReportActionItemSource,
    recordsByKey: Map<string, TeamReportActionItem>,
  ) {
    return texts.map((text, index) =>
      this.toItemResponse(
        index,
        text,
        source,
        recordsByKey.get(this.buildKey(source, index)),
      ),
    );
  }

  private buildKey(source: TeamReportActionItemSource, itemIndex: number) {
    return `${source}#${itemIndex}`;
  }

  private toItemResponse(
    itemIndex: number,
    itemText: string,
    source: TeamReportActionItemSource,
    record?: TeamReportActionItem,
  ) {
    return {
      itemIndex,
      source,
      text: itemText,
      status: record?.status ?? TeamReportActionItemStatus.Pending,
      createdTaskId: record?.createdTaskId ?? null,
      targetTaskId: record?.targetTaskId ?? null,
      suggestedReceiverId: record?.suggestedReceiverId ?? null,
      handoverId: record?.handoverId ?? null,
      note: record?.note ?? null,
      handledAt: record?.handledAt ?? null,
    };
  }

  private buildTaskTitle(itemText: string) {
    const title = itemText.trim().slice(0, 200);

    if (title.length < 2) {
      throw new BadRequestException('Noi dung de xuat qua ngan de tao task');
    }

    return title;
  }

  private buildTaskDescription(itemText: string, reportDate: string) {
    return [
      `Duoc tao tu bao cao giao ban ngay ${reportDate}.`,
      '',
      itemText.trim(),
    ]
      .join('\n')
      .slice(0, 2000);
  }

  private getReportModel() {
    if (!this.aiReportModel) {
      throw new ServiceUnavailableException('MongoDB dang tat');
    }

    return this.aiReportModel;
  }
}
