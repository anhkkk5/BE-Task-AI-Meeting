import {
  BadRequestException,
  ConflictException,
  Injectable,
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

    if (duplicate) {
      throw new ConflictException('Daily update already exists for this date');
    }

    const dailyUpdate = await this.dailyUpdatesRepository.create({
      workspaceId,
      projectId,
      userId: currentUserId,
      sprintId: dto.sprintId ?? null,
      updateDate,
      yesterdayWork: dto.yesterdayWork.trim(),
      todayPlan: dto.todayPlan.trim(),
      blockers: this.optionalText(dto.blockers),
      notes: this.optionalText(dto.notes),
      mood: dto.mood ?? null,
    });

    return {
      success: true,
      message: 'Create daily update successfully',
      data: {
        dailyUpdate: this.toDailyUpdateResponse(dailyUpdate),
      },
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
      notes: dailyUpdate.notes,
      mood: dailyUpdate.mood,
      createdAt: dailyUpdate.createdAt,
      updatedAt: dailyUpdate.updatedAt,
    };
  }
}
