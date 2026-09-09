import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { CreateDailyUpdateDto } from '../dto/create-daily-update.dto';
import { GetDailyUpdatesQueryDto } from '../dto/get-daily-updates-query.dto';
import { UpdateDailyUpdateDto } from '../dto/update-daily-update.dto';
import { DailyUpdate } from '../entities/daily-update.entity';
import { DailyUpdatesRepository } from '../repositories/daily-updates.repository';
import { DailyUpdateAccessService } from './daily-update-access.service';
import { DailyUpdateSubmissionStatus } from '../../../common/enums/daily-update-submission-status.enum';

@Injectable()
export class DailyUpdatesService {
  constructor(
    private readonly dailyUpdatesRepository: DailyUpdatesRepository,
    private readonly dailyUpdateAccessService: DailyUpdateAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly sprintAccessService: SprintAccessService,
  ) {}

  async createDailyUpdate(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: CreateDailyUpdateDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.dailyUpdateAccessService.assertCanWriteDailyUpdate(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectActive(projectId, workspaceId);

    if (dto.sprintId) {
      await this.sprintAccessService.assertSprintInProject(
        dto.sprintId,
        projectId,
      );
    }

    const updateDate = this.normalizeDate(dto.updateDate);
    const duplicate = await this.dailyUpdatesRepository.findDuplicate(
      workspaceId,
      projectId,
      currentUserId,
      updateDate,
    );

    if (
      duplicate &&
      ![
        DailyUpdateSubmissionStatus.PendingReview,
        DailyUpdateSubmissionStatus.Missed,
      ].includes(duplicate.submissionStatus)
    ) {
      throw new ConflictException('Daily update already exists for this date');
    }

    await this.assertNeedHelpFromMember(
      dto.needHelpFromId,
      workspaceId,
      currentUserId,
    );

    const submittedData = {
      sprintId: dto.sprintId ?? null,
      yesterdayWork: dto.yesterdayWork.trim(),
      todayPlan: dto.todayPlan.trim(),
      blockers: this.optionalText(dto.blockers),
      needHelpFromId: dto.needHelpFromId ?? null,
      notes: this.optionalText(dto.notes),
      mood: dto.mood ?? null,
      submissionStatus: DailyUpdateSubmissionStatus.Submitted,
      submittedAt: new Date(),
    };
    const dailyUpdate = duplicate
      ? await this.dailyUpdatesRepository.update(duplicate, submittedData)
      : await this.dailyUpdatesRepository.create({
          workspaceId,
          projectId,
          userId: currentUserId,
          updateDate,
          generatedByAi: false,
          ...submittedData,
        });

    return {
      success: true,
      message: 'Create daily update successfully',
      data: {
        dailyUpdate: this.toDailyUpdateResponse(dailyUpdate),
      },
    };
  }

  async getMyReviewDraft(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    updateDate: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const draft = await this.dailyUpdatesRepository.findReviewDraft(
      projectId,
      currentUserId,
      this.normalizeDate(updateDate),
    );
    return {
      success: true,
      message: 'Get pending daily update draft successfully',
      data: { draft: draft ? this.toDailyUpdateResponse(draft) : null },
    };
  }

  async getMyDailyUpdates(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetDailyUpdatesQueryDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.assertValidDailyUpdateFilters(projectId, workspaceId, query, {
      validateMember: false,
    });

    const result = await this.dailyUpdatesRepository.findMy(
      projectId,
      currentUserId,
      query,
    );

    return {
      success: true,
      message: 'Get my daily updates successfully',
      data: {
        items: result.items.map((dailyUpdate) =>
          this.toDailyUpdateResponse(dailyUpdate),
        ),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      },
    };
  }

  async getTeamDailyUpdates(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetDailyUpdatesQueryDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.dailyUpdateAccessService.assertCanViewTeamDailyUpdates(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.assertValidDailyUpdateFilters(projectId, workspaceId, query, {
      validateMember: true,
    });

    const result = await this.dailyUpdatesRepository.findTeam(projectId, query);

    return {
      success: true,
      message: 'Get team daily updates successfully',
      data: {
        items: result.items.map((dailyUpdate) =>
          this.toDailyUpdateResponse(dailyUpdate),
        ),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      },
    };
  }

  async getDailyUpdateDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dailyUpdateId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const dailyUpdate =
      await this.dailyUpdateAccessService.assertDailyUpdateInProject(
        dailyUpdateId,
        projectId,
      );
    if (
      dailyUpdate.submissionStatus &&
      dailyUpdate.submissionStatus !== DailyUpdateSubmissionStatus.Submitted &&
      dailyUpdate.userId !== currentUserId
    ) {
      throw new NotFoundException('Daily update not found');
    }
    await this.dailyUpdateAccessService.assertCanViewDailyUpdate(
      currentUserId,
      workspaceId,
      dailyUpdate,
    );

    return {
      success: true,
      message: 'Get daily update detail successfully',
      data: {
        dailyUpdate: this.toDailyUpdateResponse(dailyUpdate),
      },
    };
  }

  async updateDailyUpdate(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dailyUpdateId: string,
    dto: UpdateDailyUpdateDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.dailyUpdateAccessService.assertCanWriteDailyUpdate(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const dailyUpdate =
      await this.dailyUpdateAccessService.assertDailyUpdateInProject(
        dailyUpdateId,
        projectId,
      );
    this.dailyUpdateAccessService.assertCanEditDailyUpdate(
      currentUserId,
      dailyUpdate,
    );

    if (dto.sprintId) {
      await this.sprintAccessService.assertSprintInProject(
        dto.sprintId,
        projectId,
      );
    }

    await this.assertNeedHelpFromMember(
      dto.needHelpFromId,
      workspaceId,
      currentUserId,
    );

    const updatedDailyUpdate = await this.dailyUpdatesRepository.update(
      dailyUpdate,
      {
        sprintId:
          dto.sprintId === undefined ? dailyUpdate.sprintId : dto.sprintId,
        yesterdayWork:
          dto.yesterdayWork === undefined
            ? dailyUpdate.yesterdayWork
            : dto.yesterdayWork.trim(),
        todayPlan:
          dto.todayPlan === undefined
            ? dailyUpdate.todayPlan
            : dto.todayPlan.trim(),
        blockers:
          dto.blockers === undefined
            ? dailyUpdate.blockers
            : this.optionalText(dto.blockers),
        needHelpFromId:
          dto.needHelpFromId === undefined
            ? dailyUpdate.needHelpFromId
            : (dto.needHelpFromId ?? null),
        notes:
          dto.notes === undefined
            ? dailyUpdate.notes
            : this.optionalText(dto.notes),
        mood: dto.mood === undefined ? dailyUpdate.mood : dto.mood,
      },
    );

    return {
      success: true,
      message: 'Update daily update successfully',
      data: {
        dailyUpdate: this.toDailyUpdateResponse(updatedDailyUpdate),
      },
    };
  }

  async archiveDailyUpdate(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dailyUpdateId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.dailyUpdateAccessService.assertCanWriteDailyUpdate(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const dailyUpdate =
      await this.dailyUpdateAccessService.assertDailyUpdateInProject(
        dailyUpdateId,
        projectId,
      );
    this.dailyUpdateAccessService.assertCanEditDailyUpdate(
      currentUserId,
      dailyUpdate,
    );

    await this.dailyUpdatesRepository.archive(dailyUpdate);

    return {
      success: true,
      message: 'Archive daily update successfully',
      data: null,
    };
  }

  async restoreDailyUpdate(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dailyUpdateId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.dailyUpdateAccessService.assertCanWriteDailyUpdate(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const dailyUpdate =
      await this.dailyUpdatesRepository.findArchivedByIdAndProject(
        dailyUpdateId,
        projectId,
      );

    if (!dailyUpdate || !dailyUpdate.deletedAt) {
      throw new NotFoundException('Không tìm thấy Daily Update đã lưu trữ');
    }
    this.dailyUpdateAccessService.assertCanEditDailyUpdate(
      currentUserId,
      dailyUpdate,
    );
    const restored = await this.dailyUpdatesRepository.restore(dailyUpdate);

    return {
      success: true,
      message: 'Khôi phục Daily Update thành công',
      data: { dailyUpdate: restored ? this.toDailyUpdateResponse(restored) : null },
    };
  }

  private async assertValidDailyUpdateFilters(
    projectId: string,
    workspaceId: string,
    query: GetDailyUpdatesQueryDto,
    options: { validateMember: boolean },
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

    if (options.validateMember && query.memberId) {
      await this.workspaceAccessService.assertWorkspaceMember(
        query.memberId,
        workspaceId,
      );
    }
  }

  /**
   * Nguoi duoc nho ho tro phai la thanh vien cua workspace, va khong the la
   * chinh minh. Khong kiem tra thi bao cao co the tro den nguoi ngoai du an,
   * lam sai phan tong hop "ai dang can ho tro" cua bao cao giao ban.
   */
  private async assertNeedHelpFromMember(
    needHelpFromId: string | null | undefined,
    workspaceId: string,
    currentUserId: string,
  ) {
    if (!needHelpFromId) {
      return;
    }

    if (needHelpFromId === currentUserId) {
      throw new BadRequestException('Khong the tu nho chinh minh ho tro');
    }

    await this.workspaceAccessService.assertWorkspaceMember(
      needHelpFromId,
      workspaceId,
    );
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }

  private optionalText(value: string | null | undefined) {
    if (value === null || value === undefined) {
      return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length ? trimmedValue : null;
  }

  private toDailyUpdateResponse(dailyUpdate: DailyUpdate) {
    return {
      id: dailyUpdate.id,
      workspaceId: dailyUpdate.workspaceId,
      projectId: dailyUpdate.projectId,
      sprintId: dailyUpdate.sprintId,
      userId: dailyUpdate.userId,
      user: dailyUpdate.user
        ? {
            id: dailyUpdate.user.id,
            fullName: dailyUpdate.user.fullName,
            email: dailyUpdate.user.email,
            avatarUrl: dailyUpdate.user.avatarUrl,
          }
        : null,
      sprint: dailyUpdate.sprint
        ? {
            id: dailyUpdate.sprint.id,
            name: dailyUpdate.sprint.name,
            status: dailyUpdate.sprint.status,
          }
        : null,
      updateDate: dailyUpdate.updateDate,
      yesterdayWork: dailyUpdate.yesterdayWork,
      todayPlan: dailyUpdate.todayPlan,
      blockers: dailyUpdate.blockers,
      needHelpFromId: dailyUpdate.needHelpFromId,
      needHelpFrom: dailyUpdate.needHelpFrom
        ? {
            id: dailyUpdate.needHelpFrom.id,
            fullName: dailyUpdate.needHelpFrom.fullName,
            email: dailyUpdate.needHelpFrom.email,
            avatarUrl: dailyUpdate.needHelpFrom.avatarUrl,
          }
        : null,
      notes: dailyUpdate.notes,
      mood: dailyUpdate.mood,
      submissionStatus: dailyUpdate.submissionStatus,
      generatedByAi: dailyUpdate.generatedByAi,
      submittedAt: dailyUpdate.submittedAt,
      createdAt: dailyUpdate.createdAt,
      updatedAt: dailyUpdate.updatedAt,
    };
  }
}
