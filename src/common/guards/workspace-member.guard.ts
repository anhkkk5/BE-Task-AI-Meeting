import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkspaceAccessService } from '../../modules/workspaces/services/workspace-access.service';

type RequestWithWorkspace = {
  params: { workspaceId?: string };
  user?: { id: string };
};

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithWorkspace>();
    const workspaceId = request.params.workspaceId;
    const userId = request.user?.id;

    if (!userId || !workspaceId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.workspaceAccessService.assertWorkspaceMember(
      userId,
      workspaceId,
    );
    return true;
  }
}
