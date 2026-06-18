import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceAccessService } from '../../modules/workspaces/services/workspace-access.service';
export declare class WorkspaceRolesGuard implements CanActivate {
    private readonly reflector;
    private readonly workspaceAccessService;
    constructor(reflector: Reflector, workspaceAccessService: WorkspaceAccessService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
