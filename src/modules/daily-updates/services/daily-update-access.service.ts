import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { DailyUpdate } from '../entities/daily-update.entity';
import { DailyUpdatesRepository } from '../repositories/daily-updates.repository';

const dailyUpdateManagerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

const dailyUpdateWriterRoles = [
  ...dailyUpdateManagerRoles,
  WorkspaceRole.Member,
];

@Injectable()
export class DailyUpdateAccessService {
  constructor(
    private readonly dailyUpdatesRepository: DailyUpdatesRepository,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  getDailyUpdateInProject(dailyUpdateId: string, projectId: string) {
    return this.dailyUpdatesRepository.findByIdAndProject(
      dailyUpdateId,
      projectId,
    );
  }

  async assertDailyUpdateInProject(dailyUpdateId: string, projectId: string) {
    const dailyUpdate = await this.getDailyUpdateInProject(
      dailyUpdateId,
      projectId,
    );

    if (!dailyUpdate) {
      throw new NotFoundException('Daily update not found in this project');
    }

    return dailyUpdate;
  }

  async assertCanViewDailyUpdate(
    currentUserId: string,
    workspaceId: string,
    dailyUpdate: DailyUpdate,
  ) {
    if (dailyUpdate.userId === currentUserId) {
      return;
    }

    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      currentUserId,
      workspaceId,
    );

    if (role && dailyUpdateManagerRoles.includes(role)) {
      return;
    }

    throw new ForbiddenException('You can not view this daily update');
  }

  assertCanEditDailyUpdate(currentUserId: string, dailyUpdate: DailyUpdate) {
    if (dailyUpdate.userId !== currentUserId) {
      throw new ForbiddenException('You can not update this daily update');
    }
  }

  async assertCanWriteDailyUpdate(currentUserId: string, workspaceId: string) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      currentUserId,
      workspaceId,
    );

    if (!role) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    if (!dailyUpdateWriterRoles.includes(role)) {
      throw new ForbiddenException('You can not write daily update');
    }

    return role;
  }

  async assertCanViewTeamDailyUpdates(
    currentUserId: string,
    workspaceId: string,
  ) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      currentUserId,
      workspaceId,
    );

    if (!role || !dailyUpdateManagerRoles.includes(role)) {
      throw new ForbiddenException('You can not view team daily updates');
    }

    return role;
  }
}
