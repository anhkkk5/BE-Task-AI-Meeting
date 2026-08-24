import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AiUserPreferencesService } from '../../users/services/ai-user-preferences.service';
import { GeneratePersonalReportDto } from '../dto/generate-personal-report.dto';
import { GetAiReportsQueryDto } from '../dto/get-ai-reports-query.dto';
import {
  AiPromptLog,
  AiPromptLogDocument,
} from '../schemas/ai-prompt-log.schema';
import { AiReport, AiReportDocument } from '../schemas/ai-report.schema';
import { AiProviderService } from './ai-provider.service';
import { AiReportAccessService } from './ai-report-access.service';
import { AiReportDataBuilderService } from './ai-report-data-builder.service';
import {
  buildReportCitations,
  buildReportClaims,
} from '../utils/report-citations';
import { PromptBuilderService } from './prompt-builder.service';

type AiReportWithTimestamps = AiReportDocument & {
  createdAt?: Date;
  updatedAt?: Date;
};

type ReportQuery = {
  workspaceId: string;
  projectId: string;
  reportType: AiReportType;
  userId?: string;
  sprintId?: string;
  reportDate?: {
    $gte?: string;
    $lte?: string;
  };
};

@Injectable()
export class AiPersonalReportService {
  constructor(
    @Optional()
    @InjectModel(AiReport.name)
    private readonly aiReportModel: Model<AiReportDocument> | null,
    @Optional()
    @InjectModel(AiPromptLog.name)
    private readonly aiPromptLogModel: Model<AiPromptLogDocument> | null,
    private readonly aiProviderService: AiProviderService,
    private readonly aiReportAccessService: AiReportAccessService,
    private readonly dataBuilderService: AiReportDataBuilderService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly sprintAccessService: SprintAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly aiUserPreferencesService: AiUserPreferencesService,
  ) {}

  generateMyPersonalDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: GeneratePersonalReportDto,
  ) {
    return this.generateReport({
      currentUserId,
      workspaceId,
      projectId,
      targetUserId: currentUserId,
      dto,
      message: 'Generate personal daily report successfully',
      managerMode: false,
    });
  }

  generateMemberPersonalDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    memberId: string,
    dto: GeneratePersonalReportDto,
  ) {
    return this.generateReport({
      currentUserId,
      workspaceId,
      projectId,
      targetUserId: memberId,
      dto,
      message: 'Generate member personal daily report successfully',
      managerMode: true,
    });
  }

  async generateScheduledPersonalDailyReport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    memberId: string,
    reportDate: string,
  ) {
    const reportModel = this.getReportModel();
    const normalizedDate = this.normalizeDate(reportDate);
    const existingReport = await reportModel
      .findOne({
        workspaceId,
        projectId,
        sprintId: null,
        userId: memberId,
        reportType: AiReportType.PersonalDailyReport,
        reportDate: normalizedDate,
      })
      .exec();

    if (existingReport) {
      return {
        generated: false,
        reportId: this.getReportId(existingReport),
      };
    }

    const response = await this.generateMemberPersonalDailyReport(
      currentUserId,
      workspaceId,
      projectId,
      memberId,
      { reportDate: normalizedDate },
    );

    return {
      generated: true,
      reportId: response.data.report.id,
    };
  }

  async getMyPersonalDailyReports(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetAiReportsQueryDto,
  ) {
    await this.aiReportAccessService.assertCanUseOwnReports(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.assertValidQuery(projectId, query);

    const result = await this.findReports(workspaceId, projectId, query, {
      userId: currentUserId,
    });

    return {
      success: true,
      message: 'Get my personal daily reports successfully',
      data: result,
    };
  }

  async getMemberPersonalDailyReports(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    memberId: string,
    query: GetAiReportsQueryDto,
  ) {
    await this.aiReportAccessService.assertCanManageMemberReports(
      currentUserId,
      workspaceId,
    );
    await this.workspaceAccessService.assertWorkspaceMember(
      memberId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.assertValidQuery(projectId, query);

    const result = await this.findReports(workspaceId, projectId, query, {
      userId: memberId,
    });

    return {
      success: true,
      message: 'Get member personal daily reports successfully',
      data: result,
    };
  }

  async getPersonalDailyReportDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
  ) {
    const reportModel = this.getReportModel();
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );

    const report = await reportModel.findById(reportId).exec();

    if (
      !report ||
      report.workspaceId !== workspaceId ||
      report.projectId !== projectId ||
      report.reportType !== AiReportType.PersonalDailyReport
    ) {
      throw new NotFoundException('Report not found in this project');
    }

    await this.aiReportAccessService.assertCanViewReport(
      currentUserId,
      workspaceId,
      report,
    );

    return {
      success: true,
      message: 'Get personal daily report detail successfully',
      data: {
        report: this.toReportResponse(report, true),
      },
    };
  }

  private async generateReport(params: {
    currentUserId: string;
    workspaceId: string;
    projectId: string;
    targetUserId: string;
    dto: GeneratePersonalReportDto;
    message: string;
    managerMode: boolean;
  }) {
    const reportModel = this.getReportModel();

    if (params.managerMode) {
      await this.aiReportAccessService.assertCanManageMemberReports(
        params.currentUserId,
        params.workspaceId,
      );
      await this.workspaceAccessService.assertWorkspaceMember(
        params.targetUserId,
        params.workspaceId,
      );
    } else {
      await this.aiReportAccessService.assertCanUseOwnReports(
        params.currentUserId,
        params.workspaceId,
      );
    }

    await this.projectAccessService.assertProjectInWorkspace(
      params.projectId,
      params.workspaceId,
    );

    if (params.dto.sprintId) {
      await this.sprintAccessService.assertSprintInProject(
        params.dto.sprintId,
        params.projectId,
      );
    }

    const inputData =
      await this.dataBuilderService.buildPersonalDailyReportInput({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        targetUserId: params.targetUserId,
        reportDate: params.dto.reportDate,
        sprintId: params.dto.sprintId,
      });
    const preferences =
      await this.aiUserPreferencesService.getResolvedPreferences(
        params.targetUserId,
      );
    const prompt = this.promptBuilderService.buildPersonalDailyReportPrompt(
      inputData,
      preferences,
    );
    const startedAt = Date.now();

    try {
      const aiResult = await this.aiProviderService.generatePersonalDailyReport(
        prompt,
        inputData,
      );

      const report = await reportModel.create({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        sprintId: params.dto.sprintId ?? null,
        userId: params.targetUserId,
        reportType: AiReportType.PersonalDailyReport,
        reportDate: inputData.reportDate,
        inputData,
        aiOutput: aiResult.output,
        aiModel: aiResult.model,
        status: AiReportStatus.Completed,
        createdBy: params.currentUserId,
      });

      await this.writePromptLog({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        userId: params.targetUserId,
        model: aiResult.model,
        prompt,
        response: aiResult.rawResponse,
        responseTimeMs: Date.now() - startedAt,
        success: true,
      });

      return {
        success: true,
        message: params.message,
        data: {
          report: this.toReportResponse(report, true),
        },
      };
    } catch (error) {
      await this.writePromptLog({
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        userId: params.targetUserId,
        model: process.env.AI_MODEL ?? 'mock-personal-report',
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

  private async findReports(
    workspaceId: string,
    projectId: string,
    query: GetAiReportsQueryDto,
    options: { userId: string },
  ) {
    const reportModel = this.getReportModel();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const mongoQuery: ReportQuery = {
      workspaceId,
      projectId,
      reportType: AiReportType.PersonalDailyReport,
      userId: options.userId,
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
    query: GetAiReportsQueryDto,
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
      feature: AiReportType.PersonalDailyReport,
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
      userId: report.userId,
      reportType: report.reportType,
      reportDate: report.reportDate,
      aiOutput: report.aiOutput,
      summary: report.aiOutput?.summary ?? null,
      model: report.aiModel ?? null,
      status: report.status,
      createdBy: report.createdBy,
      ...(includeInputData
        ? {
            inputData: report.inputData,
            citations: buildReportCitations(report.inputData),
            claims: buildReportClaims(report.aiOutput, report.inputData),
          }
        : {}),
      createdAt: stampedReport.createdAt,
      updatedAt: stampedReport.updatedAt,
    };
  }
}
