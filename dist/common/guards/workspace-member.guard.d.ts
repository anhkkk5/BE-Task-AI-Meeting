import { CanActivate, ExecutionContext } from '@nestjs/common';
import { WorkspaceAccessService } from '../../modules/workspaces/services/workspace-access.service';
export declare class WorkspaceMemberGuard implements CanActivate {
    private readonly workspaceAccessService;
    constructor(workspaceAccessService: WorkspaceAccessService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
