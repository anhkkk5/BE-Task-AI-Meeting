import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AiReportReviewStatus,
  isFinalReviewStatus,
  normalizeReviewStatus,
} from '../../../common/enums/ai-report-review-status.enum';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { GenerateTeamReportDto } from '../dto/generate-team-report.dto';
import { GetAiTeamReportsQueryDto } from '../dto/get-ai-team-reports-query.dto';
import { UpdateTeamReportDto } from '../dto/update-team-report.dto';
import {
  AiPromptLog,
  AiPromptLogDocument,
} from '../schemas/ai-prompt-log.schema';
import {
  AiReport,
  AiReportDocument,
  TeamDailyReportOutput,
} from '../schemas/ai-report.schema';
import { AiProviderService } from './ai-provider.service';
import { AiReportAccessService } from './ai-report-access.service';
import { AiReportEventsService } from './ai-report-events.service';
import { AiTeamReportDataBuilderService } from './ai-team-report-data-builder.service';
import { PromptBuilderService } from './prompt-builder.service';

type AiReportWithTimestamps = AiReportDocument & {
  createdAt?: Date;
  updatedAt?: Date;
};

type TeamReportQuery = {
  workspaceId: string;
  projectId: string;
  reportType: AiReportType;
  sprintId?: string;
  reportDate?: {
    $gte?: string;
    $lte?: string;
  };
};

@Injectable()
export class AiTeamReportService {
  private readonly rateLimitWindowMs = 10 * 60 * 1000;
  private readonly rateLimitMax = 5;
  private readonly generateHits = new Map<string, number[]>();

  constructor(
    @Optional()
    @InjectModel(AiReport.name)
    private readonly aiReportModel: Model<AiReportDocument> | null,
    @Optional()
    @InjectModel(AiPromptLog.name)
    private readonly aiPromptLogModel: Model<AiPromptLogDocument> | null,
    private readonly aiProviderService: AiProviderService,
    private readonly aiReportAccessService: AiReportAccessService,
    private readonly dataBuilderService: AiTeamReportDataBuilderService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly sprintAccessService: SprintAccessService,
    private readonly aiReportEventsService: AiReportEventsService,
  ) {}

  async generateTeamDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: GenerateTeamReportDto,
  ) {
    const reportModel = this.getReportModel();

    await this.aiReportAccessService.assertCanUseTeamReports(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );

    if (dto.sprintId) {
      await this.sprintAccessService.assertSprintInProject(
        dto.sprintId,
        projectId,
      );
    }

    this.assertGenerateRateLimit(workspaceId, projectId);

    const inputData = await this.dataBuilderService.buildTeamReportInput({
      workspaceId,
      projectId,
      reportDate: dto.reportDate,
      sprintId: dto.sprintId,
      dataSources: dto.dataSources,
    });
    const prompt = this.promptBuilderService.buildTeamDailyReportPrompt(
      inputData,
      dto.extraInstruction,
    );
    const startedAt = Date.now();

    try {
      const aiResult = await this.aiProviderService.generateTeamDailyReport(
        prompt,
        inputData,
      );
      const report = await reportModel.create({
        workspaceId,
        projectId,
        sprintId: dto.sprintId ?? null,
        userId: null,
        reportType: AiReportType.TeamDailyReport,
        reportDate: inputData.reportDate,
        inputData,
        aiOutput: aiResult.output,
        aiModel: aiResult.model,
        status: AiReportStatus.Completed,
        // AI chi sinh ban nhap, phai co nguoi duyet moi thanh bao cao chinh thuc.
        reviewStatus: AiReportReviewStatus.PendingReview,
        metrics: this.dataBuilderService.computeMetrics(inputData),
        dataSources: inputData.dataSources,
        extraInstruction: dto.extraInstruction?.trim() || null,
        createdBy: currentUserId,
      });

      await this.writePromptLog({
        workspaceId,
        projectId,
        userId: currentUserId,
        model: aiResult.model,
        prompt,
        response: aiResult.rawResponse,
        responseTimeMs: Date.now() - startedAt,
        success: true,
      });

      return {
        success: true,
        message: 'Generate team daily report successfully',
        data: {
          report: this.toReportResponse(report, true),
        },
      };
    } catch (error) {
      await this.writePromptLog({
        workspaceId,
        projectId,
        userId: currentUserId,
        model: process.env.AI_MODEL ?? 'mock-team-report',
        prompt,
        response: '',
        responseTimeMs: Date.now() - startedAt,
        success: false,
        errorMessage:
          error instanceof Error ? error.message : 'AI provider failed',
      });
      throw new ServiceUnavailableException('AI provider failed');
    }
  }

  async generateScheduledTeamDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportDate: string,
  ) {
    const reportModel = this.getReportModel();
    const normalizedDate = this.normalizeDate(reportDate);
    const existingReport = await reportModel
      .findOne({
        workspaceId,
        projectId,
        sprintId: null,
        userId: null,
        reportType: AiReportType.TeamDailyReport,
        reportDate: normalizedDate,
      })
      .exec();

    if (existingReport) {
      return {
        generated: false,
        reportId: this.getReportId(existingReport),
      };
    }

    const response = await this.generateTeamDailyReport(
      currentUserId,
      workspaceId,
      projectId,
      { reportDate: normalizedDate },
    );

    return {
      generated: true,
      reportId: response.data.report.id,
    };
  }

  async getTeamDailyReports(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetAiTeamReportsQueryDto,
  ) {
    await this.aiReportAccessService.assertCanUseTeamReports(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.assertValidQuery(projectId, query);

    const result = await this.findReports(workspaceId, projectId, query);

    return {
      success: true,
      message: 'Get team daily reports successfully',
      data: result,
    };
  }

  async getLatestTeamDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetAiTeamReportsQueryDto,
  ) {
    const reportModel = this.getReportModel();
    await this.aiReportAccessService.assertCanUseTeamReports(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.assertValidQuery(projectId, query);

    const mongoQuery = this.buildMongoQuery(workspaceId, projectId, query);
    const report = await reportModel
      .findOne(mongoQuery)
      .sort({ reportDate: -1, createdAt: -1 })
      .exec();

    return {
      success: true,
      message: 'Get latest team daily report successfully',
      data: {
        report: report ? this.toReportResponse(report, false) : null,
      },
    };
  }

  /**
   * Doc chi tiet mot bao cao giao ban.
   *
   * Mail duyet bao cao duoc gui cho moi thanh vien workspace nen endpoint nay
   * phai mo cho ca thanh vien thuong, neu khong link trong mail se tra 403.
   * Bu lai, ban chua phat hanh van kin voi nguoi ngoai nhom quan ly de nhom
   * khong doc nham so lieu chua chot.
   */
  async getTeamDailyReportDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    const { report, canManage } = await this.findTeamReportForRead(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
    );

    return {
      success: true,
      message: 'Get team daily report detail successfully',
      data: {
        report: this.toReportResponse(report, canManage),
        canManage,
      },
    };
  }

  /**
   * Sua noi dung bao cao do AI sinh.
   *
   * Chi ghi de dung nhung muc nguoi dung gui len, cac muc con lai giu nguyen
   * ban AI. `inputData` va `metrics` khong bao gio bi sua vi do la du lieu goc.
   */
  async updateTeamDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
    dto: UpdateTeamReportDto,
  ) {
    const report = await this.findTeamReportOrFail(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
    );

    const currentStatus = this.resolveReviewStatus(report);

    if (isFinalReviewStatus(currentStatus)) {
      throw new ConflictException(
        currentStatus === AiReportReviewStatus.Cancelled
          ? 'Phiên giao ban đã bị hủy nên không thể chỉnh sửa'
          : 'Báo cáo đã được duyệt nên không thể chỉnh sửa',
      );
    }

    const currentOutput = (report.aiOutput ?? {}) as TeamDailyReportOutput;
    const patch: Partial<TeamDailyReportOutput> = {};

    if (dto.summary !== undefined) patch.summary = dto.summary;
    if (dto.teamProgress !== undefined) patch.teamProgress = dto.teamProgress;
    if (dto.completedWork !== undefined) patch.completedWork = dto.completedWork;
    if (dto.todayFocus !== undefined) patch.todayFocus = dto.todayFocus;
    if (dto.blockers !== undefined) patch.blockers = dto.blockers;
    if (dto.risks !== undefined) patch.risks = dto.risks;
    if (dto.recommendations !== undefined) {
      patch.recommendations = dto.recommendations;
    }

    if (!Object.keys(patch).length) {
      throw new BadRequestException('Không có nội dung nào được thay đổi');
    }

    report.aiOutput = { ...currentOutput, ...patch };
    // Sua noi dung xong van la ban cho duyet, chua phai bao cao chinh thuc.
    report.reviewStatus = AiReportReviewStatus.PendingReview;
    report.editedBy = currentUserId;
    report.editedAt = new Date();
    report.markModified('aiOutput');
    await report.save();

    return {
      success: true,
      message: 'Update team daily report successfully',
      data: {
        report: this.toReportResponse(report, true),
      },
    };
  }

  /**
   * Duyet bao cao: tu ban nhap thanh bao cao giao ban chinh thuc.
   *
   * Su kien phat ra o day la moc de gui mail cho ca nhom, nen chi bao cao da
   * duyet moi tao thong bao.
   */
  async approveTeamDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    const report = await this.findTeamReportOrFail(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
    );

    const currentStatus = this.resolveReviewStatus(report);

    if (currentStatus === AiReportReviewStatus.Published) {
      throw new ConflictException('Báo cáo này đã được duyệt trước đó');
    }

    if (currentStatus === AiReportReviewStatus.Cancelled) {
      throw new ConflictException('Phiên giao ban đã bị hủy nên không thể duyệt');
    }

    report.reviewStatus = AiReportReviewStatus.Published;
    report.approvedBy = currentUserId;
    report.approvedAt = new Date();
    await report.save();

    this.aiReportEventsService.publish({
      type: 'team_report_approved',
      reportId: this.getReportId(report),
      workspaceId,
      projectId,
      reportDate: report.reportDate,
      approvedBy: currentUserId,
      title: (report.aiOutput as TeamDailyReportOutput)?.title ?? null,
      summary: (report.aiOutput as TeamDailyReportOutput)?.summary ?? null,
    });

    return {
      success: true,
      message: 'Approve team daily report successfully',
      data: {
        report: this.toReportResponse(report, true),
      },
    };
  }

  /**
   * Huy phien giao ban.
   *
   * Dung khi phien duoc tao nham hoac ca doi khong giao ban ngay do. Khong xoa
   * du lieu vi con dung de doi chieu lich su, chi danh dau CANCELLED de khong
   * tinh vao bao cao chinh thuc va khong gui mail cho ca nhom.
   */
  async cancelTeamDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    const report = await this.findTeamReportOrFail(
      currentUserId,
      workspaceId,
      projectId,
      reportId,
    );
    const currentStatus = this.resolveReviewStatus(report);

    if (currentStatus === AiReportReviewStatus.Published) {
      throw new ConflictException(
        'Báo cáo đã duyệt và gửi cho cả nhóm nên không thể hủy',
      );
    }

    if (currentStatus === AiReportReviewStatus.Cancelled) {
      throw new ConflictException('Phiên giao ban này đã bị hủy trước đó');
    }

    report.reviewStatus = AiReportReviewStatus.Cancelled;
    report.editedBy = currentUserId;
    report.editedAt = new Date();
    await report.save();

    return {
      success: true,
      message: 'Cancel team daily report successfully',
      data: {
        report: this.toReportResponse(report, true),
      },
    };
  }

  private async findTeamReportOrFail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    await this.aiReportAccessService.assertCanUseTeamReports(
      currentUserId,
      workspaceId,
    );

    return this.loadTeamReport(workspaceId, projectId, reportId);
  }

  /**
   * Lay bao cao cho muc dich chi doc.
   *
   * Tach thanh ham rieng thay vi noi long `findTeamReportOrFail` de cac hanh
   * dong ghi (sua, duyet, huy) khong bi mo quyen theo.
   *
   * Tra kem `canManage` de service khong phai hoi lai role lan hai va de
   * frontend biet co nen hien nut sua/duyet hay khong.
   */
  async findTeamReportForRead(
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
    const report = await this.loadTeamReport(workspaceId, projectId, reportId);

    if (
      !canManage &&
      this.resolveReviewStatus(report) !== AiReportReviewStatus.Published
    ) {
      throw new ForbiddenException(
        'Báo cáo giao ban này chưa được phát hành cho cả nhóm',
      );
    }

    return { report, canManage };
  }

  private async loadTeamReport(
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
      throw new NotFoundException('Report not found in this project');
    }

    return report;
  }

  /**
   * Doc trang thai phien giao ban, co anh xa du lieu cu.
   *
   * Logic anh xa nam trong enum de cac service khac dung lai duoc.
   */
  private resolveReviewStatus(report: AiReportDocument) {
    return normalizeReviewStatus(report.reviewStatus);
  }

  private async findReports(
    workspaceId: string,
    projectId: string,
    query: GetAiTeamReportsQueryDto,
  ) {
    const reportModel = this.getReportModel();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const mongoQuery = this.buildMongoQuery(workspaceId, projectId, query);
    const [items, total] = await Promise.all([
      reportModel
        .find(mongoQuery)
        .sort({ reportDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      reportModel.countDocuments(mongoQuery).exec(),
    ]);

    return {
      items: items.map((report) => this.toReportResponse(report, false)),
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  private async assertValidQuery(
    projectId: string,
    query: GetAiTeamReportsQueryDto,
  ) {
    if (query.fromDate && query.toDate) {
      const fromDate = this.normalizeDate(query.fromDate);
      const toDate = this.normalizeDate(query.toDate);

      if (fromDate > toDate) {
        throw new BadRequestException(
          'fromDate must be before or equal to toDate',
        );
      }
    }

    if (query.sprintId) {
      await this.sprintAccessService.assertSprintInProject(
        query.sprintId,
        projectId,
      );
    }
  }

  private buildMongoQuery(
    workspaceId: string,
    projectId: string,
    query: GetAiTeamReportsQueryDto,
  ) {
    const mongoQuery: TeamReportQuery = {
      workspaceId,
      projectId,
      reportType: AiReportType.TeamDailyReport,
    };

    if (query.sprintId) {
      mongoQuery.sprintId = query.sprintId;
    }

    if (query.fromDate || query.toDate) {
      mongoQuery.reportDate = {};

      if (query.fromDate) {
        mongoQuery.reportDate.$gte = this.normalizeDate(query.fromDate);
      }

      if (query.toDate) {
        mongoQuery.reportDate.$lte = this.normalizeDate(query.toDate);
      }
    }

    return mongoQuery;
  }

  private assertGenerateRateLimit(workspaceId: string, projectId: string) {
    const key = `${workspaceId}:${projectId}`;
    const now = Date.now();
    const validHits = (this.generateHits.get(key) ?? []).filter(
      (hit) => now - hit < this.rateLimitWindowMs,
    );

    if (validHits.length >= this.rateLimitMax) {
      throw new HttpException(
        'Too many AI team report requests for this project',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    validHits.push(now);
    this.generateHits.set(key, validHits);
  }

  private async writePromptLog(payload: {
    workspaceId: string;
    projectId: string;
    userId: string;
    model: string;
    prompt: string;
    response: string;
    responseTimeMs: number;
    success: boolean;
    errorMessage?: string;
  }) {
    if (!this.aiPromptLogModel) {
      return;
    }

    await this.aiPromptLogModel.create({
      workspaceId: payload.workspaceId,
      projectId: payload.projectId,
      userId: payload.userId,
      feature: AiReportType.TeamDailyReport,
      aiModel: payload.model,
      prompt: payload.prompt,
      response: payload.response,
      responseTimeMs: payload.responseTimeMs,
      success: payload.success,
      errorMessage: payload.errorMessage ?? null,
    });
  }

  private getReportModel() {
    if (!this.aiReportModel) {
      throw new ServiceUnavailableException('MongoDB is disabled');
    }

    return this.aiReportModel;
  }

  private getReportId(report: AiReportDocument) {
    return report._id.toString();
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }

  private toReportResponse(
    report: AiReportDocument,
    includeInputData: boolean,
  ) {
    const stampedReport = report as AiReportWithTimestamps;

    return {
      id: this.getReportId(report),
      workspaceId: report.workspaceId,
      projectId: report.projectId,
      sprintId: report.sprintId ?? null,
      userId: report.userId ?? null,
      reportType: report.reportType,
      reportDate: report.reportDate,
      aiOutput: report.aiOutput,
      summary: report.aiOutput?.summary ?? null,
      model: report.aiModel ?? null,
      status: report.status,
      // Cac truong duoi day tra ve ca o danh sach vi UI can ve badge trang thai
      // va the so lieu ngay tren card, khong chi o trang chi tiet.
      reviewStatus: this.resolveReviewStatus(report),
      metrics: report.metrics ?? null,
      dataSources: report.dataSources ?? null,
      extraInstruction: report.extraInstruction ?? null,
      editedBy: report.editedBy ?? null,
      editedAt: report.editedAt ?? null,
      approvedBy: report.approvedBy ?? null,
      approvedAt: report.approvedAt ?? null,
      createdBy: report.createdBy,
      ...(includeInputData ? { inputData: report.inputData } : {}),
      createdAt: stampedReport.createdAt,
      updatedAt: stampedReport.updatedAt,
    };
  }
}
