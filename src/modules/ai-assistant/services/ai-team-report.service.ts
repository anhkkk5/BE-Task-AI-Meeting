import {
  BadRequestException,
  HttpException,
  HttpStatus,
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
import { GenerateTeamReportDto } from '../dto/generate-team-report.dto';
import { GetAiTeamReportsQueryDto } from '../dto/get-ai-team-reports-query.dto';
import {
  AiPromptLog,
  AiPromptLogDocument,
} from '../schemas/ai-prompt-log.schema';
import { AiReport, AiReportDocument } from '../schemas/ai-report.schema';
import { AiProviderService } from './ai-provider.service';
import { AiReportAccessService } from './ai-report-access.service';
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
    });
    const prompt =
      this.promptBuilderService.buildTeamDailyReportPrompt(inputData);
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

  async getTeamDailyReportDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    reportId: string,
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

    const report = await reportModel.findById(reportId).exec();

    if (
      !report ||
      report.workspaceId !== workspaceId ||
      report.projectId !== projectId ||
      report.reportType !== AiReportType.TeamDailyReport
    ) {
      throw new NotFoundException('Report not found in this project');
    }

    return {
      success: true,
      message: 'Get team daily report detail successfully',
      data: {
        report: this.toReportResponse(report, true),
      },
    };
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
      createdBy: report.createdBy,
      ...(includeInputData ? { inputData: report.inputData } : {}),
      createdAt: stampedReport.createdAt,
      updatedAt: stampedReport.updatedAt,
    };
  }
}
