import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../modules/workspaces/services/workspace-access.service';

type RequestWithWorkspace = {
  params: { workspaceId?: string };
  user?: { id: string };
};

@Injectable()
export class WorkspaceRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithWorkspace>();
    const workspaceId = request.params.workspaceId;
    const userId = request.user?.id;

    if (!userId || !workspaceId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const role = await this.workspaceAccessService.getUserWorkspaceRole(
      userId,
      workspaceId,
    );

    if (!role || !roles.includes(role)) {
      throw new ForbiddenException(
        'Only workspace owner can perform this action',
      );
    }

    return true;
  }
}
