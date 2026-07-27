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

    /*
     * Dung ban rut gon co cache thay vi lay ca entity.
     * Guard nay chay tren gan nhu moi request, va mot lan mo trang cua frontend
     * ban nhieu request song song cho cung mot workspace, nen truoc day phat
     * sinh nhieu query giong nhau. Guard chi can biet co quyen hay khong.
     */
    await this.workspaceAccessService.assertWorkspaceMembership(
      userId,
      workspaceId,
    );
    return true;
  }
}
