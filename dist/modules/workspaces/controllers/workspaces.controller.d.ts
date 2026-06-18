import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { GetWorkspacesQueryDto } from '../dto/get-workspaces-query.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import { WorkspacesService } from '../services/workspaces.service';
export declare class WorkspacesController {
    private readonly workspacesService;
    constructor(workspacesService: WorkspacesService);
    createWorkspace(user: AuthUser, dto: CreateWorkspaceDto): Promise<{
        success: boolean;
        message: string;
        data: {
            workspace: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                ownerId: string;
                plan: import("../../../common/enums/workspace-plan.enum").WorkspacePlan;
                status: import("../../../common/enums/workspace-status.enum").WorkspaceStatus;
                createdAt: Date;
            };
        };
    }>;
    getMyWorkspaces(user: AuthUser, query: GetWorkspacesQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                role: import("../../../common/enums/workspace-role.enum").WorkspaceRole;
                id: string;
                name: string;
                slug: string;
                description: string | null;
                ownerId: string;
                plan: import("../../../common/enums/workspace-plan.enum").WorkspacePlan;
                status: import("../../../common/enums/workspace-status.enum").WorkspaceStatus;
                createdAt: Date;
            }[];
        };
    }>;
    getWorkspaceDetail(user: AuthUser, workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            workspace: {
                myRole: import("../../../common/enums/workspace-role.enum").WorkspaceRole;
                updatedAt: Date;
                id: string;
                name: string;
                slug: string;
                description: string | null;
                ownerId: string;
                plan: import("../../../common/enums/workspace-plan.enum").WorkspacePlan;
                status: import("../../../common/enums/workspace-status.enum").WorkspaceStatus;
                createdAt: Date;
            };
        };
    }>;
    updateWorkspace(user: AuthUser, workspaceId: string, dto: UpdateWorkspaceDto): Promise<{
        success: boolean;
        message: string;
        data: {
            workspace: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                ownerId: string;
                plan: import("../../../common/enums/workspace-plan.enum").WorkspacePlan;
                status: import("../../../common/enums/workspace-status.enum").WorkspaceStatus;
                createdAt: Date;
            };
        };
    }>;
    archiveWorkspace(user: AuthUser, workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
