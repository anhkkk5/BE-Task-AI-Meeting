import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { AiUserPreferencesService } from '../../users/services/ai-user-preferences.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { DraftDailyUpdateDto } from '../dto/draft-daily-update.dto';
import { DraftHandoverDto } from '../dto/draft-handover.dto';
import { HandoverDraftInputData } from '../types/ai-draft.type';
import { AiProviderService } from './ai-provider.service';
import { AiReportDataBuilderService } from './ai-report-data-builder.service';
import { PromptBuilderService } from './prompt-builder.service';

@Injectable()
export class AiDraftService {
  constructor(
    private readonly aiProviderService: AiProviderService,
    private readonly dataBuilderService: AiReportDataBuilderService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly tasksRepository: TasksRepository,
    private readonly dailyUpdatesRepository: DailyUpdatesRepository,
    private readonly aiUserPreferencesService: AiUserPreferencesService,
  ) {}

  /**
   * Sinh nhap bao cao ca nhan cho chinh nguoi goi.
   *
   * Khong ghi vao DB: nguoi dung phai doc lai va tu bam gui, neu khong ho se
   * ky ten vao noi dung AI tu suy ra ma minh chua kiem tra.
   */
  async draftMyDailyUpdate(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: DraftDailyUpdateDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );

    const inputData =
      await this.dataBuilderService.buildPersonalDailyReportInput({
        workspaceId,
        projectId,
        targetUserId: currentUserId,
        reportDate: dto.updateDate,
        sprintId: dto.sprintId ?? undefined,
      });
    const preferences =
      await this.aiUserPreferencesService.getResolvedPreferences(currentUserId);
    const prompt = this.promptBuilderService.buildDailyUpdateDraftPrompt(
      inputData,
      preferences,
    );

    try {
      const result = await this.aiProviderService.generateDailyUpdateDraft(
        prompt,
        inputData,
      );

      return {
        success: true,
        message: 'Soan nhap bao cao ca nhan thanh cong',
        data: {
          draft: result.output,
          model: result.model,
        },
      };
    } catch {
      throw new ServiceUnavailableException('AI provider failed');
    }
  }

  /**
   * Sinh nhap noi dung ban giao cho mot task.
   *
   * Chi nguoi dang duoc gan task moi soan duoc, vi ban giao la hanh dong cua
   * nguoi dang giu viec.
   */
  async draftHandover(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: DraftHandoverDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const project = await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const task = await this.tasksRepository.findByIdAndProject(
      dto.taskId,
      projectId,
    );

    if (!task) {
      throw new NotFoundException('Task not found in this project');
    }

    if (task.assigneeId !== currentUserId) {
      throw new ForbiddenException(
        'Chi nguoi dang duoc gan task moi soan duoc noi dung ban giao',
      );
    }

    const receiver = dto.receiverId
      ? await this.workspaceAccessService.assertWorkspaceMember(
          dto.receiverId,
          workspaceId,
        )
      : null;
    const recentUpdates = await this.dailyUpdatesRepository.findMy(
      projectId,
      currentUserId,
      { page: 1, limit: 5 },
    );
    const inputData: HandoverDraftInputData = {
      task: {
        id: task.id,
        taskCode: task.taskCode,
        title: task.title,
        description: task.description ?? null,
        status: task.status,
        workflowStatusId: task.workflowStatusId,
        workflowStatusKey: task.workflowStatusKey ?? task.status,
        dueDate: task.dueDate ?? null,
        assigneeName: task.assignee?.fullName ?? null,
      },
      project: {
        id: project.id,
        name: project.name,
        keyCode: project.keyCode,
      },
      recentDailyUpdates: recentUpdates.items.map((item) => ({
        updateDate: item.updateDate,
        yesterdayWork: item.yesterdayWork,
        todayPlan: item.todayPlan,
        blockers: item.blockers,
      })),
      receiverName: receiver?.user?.fullName ?? null,
    };
    const prompt =
      this.promptBuilderService.buildHandoverDraftPrompt(inputData);

    try {
      const result = await this.aiProviderService.generateHandoverDraft(
        prompt,
        inputData,
      );

      return {
        success: true,
        message: 'Soan nhap noi dung ban giao thanh cong',
        data: {
          draft: result.output,
          model: result.model,
        },
      };
    } catch {
      throw new ServiceUnavailableException('AI provider failed');
    }
  }
}
