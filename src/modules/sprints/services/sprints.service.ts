import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { GetSprintsQueryDto } from '../dto/get-sprints-query.dto';
import { UpdateSprintDto } from '../dto/update-sprint.dto';
import { Sprint } from '../entities/sprint.entity';
import { SprintsRepository } from '../repositories/sprints.repository';
import { SprintAccessService } from './sprint-access.service';

const sprintManagerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

@Injectable()
export class SprintsService {
  constructor(
    private readonly sprintsRepository: SprintsRepository,
    private readonly sprintAccessService: SprintAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async createSprint(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: CreateSprintDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    this.assertDateRange(dto.startDate, dto.endDate);

    const sprint = await this.sprintsRepository.create({
      projectId,
      name: dto.name.trim(),
      goal: dto.goal?.trim() || null,
      startDate: dto.startDate,
      endDate: dto.endDate,
      createdBy: currentUserId,
    });

    return {
      success: true,
      message: 'Create sprint successfully',
      data: {
        sprint: this.toSprintResponse(sprint),
      },
    };
  }

  async getSprints(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetSprintsQueryDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const result = await this.sprintsRepository.findByProject(projectId, query);

    return {
      success: true,
      message: 'Get sprints successfully',
      data: {
        items: result.items.map((sprint) => this.toSprintResponse(sprint)),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      },
    };
  }

  async getSprintDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const sprint = await this.sprintAccessService.assertSprintInProject(
      sprintId,
      projectId,
    );

    return {
      success: true,
      message: 'Get sprint detail successfully',
      data: {
        sprint: this.toSprintResponse(sprint),
      },
    };
  }

  async updateSprint(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
    dto: UpdateSprintDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const sprint = await this.sprintAccessService.assertSprintPlanned(
      sprintId,
      projectId,
    );
    const nextStartDate = dto.startDate ?? sprint.startDate;
    const nextEndDate = dto.endDate ?? sprint.endDate;
    this.assertDateRange(nextStartDate, nextEndDate);

    const updatedSprint = await this.sprintsRepository.update(sprint, {
      name: dto.name?.trim() ?? sprint.name,
      goal: dto.goal === undefined ? sprint.goal : dto.goal.trim() || null,
      startDate: nextStartDate,
      endDate: nextEndDate,
    });

    return {
      success: true,
      message: 'Update sprint successfully',
      data: {
        sprint: this.toSprintResponse(updatedSprint),
      },
    };
  }

  async startSprint(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const sprint = await this.sprintAccessService.assertSprintPlanned(
      sprintId,
      projectId,
    );
    await this.sprintAccessService.assertProjectHasNoActiveSprint(
      projectId,
      sprintId,
    );
    const updatedSprint = await this.sprintsRepository.update(sprint, {
      status: SprintStatus.Active,
      startedAt: new Date(),
    });

    return {
      success: true,
      message: 'Start sprint successfully',
      data: {
        sprint: this.toSprintResponse(updatedSprint),
      },
    };
  }

  async completeSprint(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const sprint = await this.sprintAccessService.assertSprintActive(
      sprintId,
      projectId,
    );
    const updatedSprint = await this.sprintsRepository.update(sprint, {
      status: SprintStatus.Completed,
      completedAt: new Date(),
    });

    return {
      success: true,
      message: 'Complete sprint successfully',
      data: {
        sprint: this.toSprintResponse(updatedSprint),
      },
    };
  }

  async cancelSprint(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const sprint = await this.sprintAccessService.assertSprintInProject(
      sprintId,
      projectId,
    );

    if (![SprintStatus.Planned, SprintStatus.Active].includes(sprint.status)) {
      throw new BadRequestException(
        'Only planned or active sprint can be cancelled',
      );
    }

    await this.sprintsRepository.update(sprint, {
      status: SprintStatus.Cancelled,
    });

    return {
      success: true,
      message: 'Cancel sprint successfully',
      data: null,
    };
  }

  async deleteSprint(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const sprint = await this.sprintAccessService.assertSprintInProject(
      sprintId,
      projectId,
    );

    if (sprint.status === SprintStatus.Active) {
      throw new BadRequestException(
        'Hãy kết thúc hoặc hủy sprint đang hoạt động trước khi xóa',
      );
    }

    if (sprint.createdBy !== currentUserId) {
      const role = await this.workspaceAccessService.getUserWorkspaceRole(
        currentUserId,
        workspaceId,
      );
      if (!role || !sprintManagerRoles.includes(role)) {
        throw new ForbiddenException('Bạn không có quyền xóa sprint này');
      }
    }

    await this.sprintsRepository.softDeleteWithTasks(sprint);

    return {
      success: true,
      message: 'Xóa sprint thành công',
      data: null,
    };
  }

  private async assertWritableProject(workspaceId: string, projectId: string) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.projectAccessService.assertProjectActive(projectId, workspaceId);
  }

  private assertDateRange(startDate: string, endDate: string) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      throw new BadRequestException(
        'endDate must not be earlier than startDate',
      );
    }
  }

  private toSprintResponse(sprint: Sprint) {
    return {
      id: sprint.id,
      projectId: sprint.projectId,
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      startedAt: sprint.startedAt,
      completedAt: sprint.completedAt,
      createdBy: sprint.createdBy,
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
    };
  }
}
