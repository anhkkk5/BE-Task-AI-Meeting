import { ForbiddenException, Injectable } from '@nestjs/common';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AiReportDocument } from '../schemas/ai-report.schema';

const managerRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
];

const allowedOwnReportRoles = [
  WorkspaceRole.Owner,
  WorkspaceRole.ScrumMaster,
  WorkspaceRole.ProjectManager,
  WorkspaceRole.Member,
];

@Injectable()
export class AiReportAccessService {
  constructor(
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async assertCanUseOwnReports(userId: string, workspaceId: string) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role || !allowedOwnReportRoles.includes(role)) {
      throw new ForbiddenException('You can not use AI personal reports');
    }

    return role;
  }

  async assertCanManageMemberReports(userId: string, workspaceId: string) {
    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role || !managerRoles.includes(role)) {
      throw new ForbiddenException(
        'You can not manage member personal reports',
      );
    }

    return role;
  }

  async assertCanViewReport(
    currentUserId: string,
    workspaceId: string,
    report: AiReportDocument,
  ) {
    const role = await this.assertCanUseOwnReports(currentUserId, workspaceId);

    if (report.userId === currentUserId) {
      return role;
    }

    if (managerRoles.includes(role)) {
      return role;
    }

    throw new ForbiddenException('You can not view this AI report');
  }

  isManagerRole(role: WorkspaceRole | string | null) {
    return Boolean(role && managerRoles.includes(role as WorkspaceRole));
  }
}
