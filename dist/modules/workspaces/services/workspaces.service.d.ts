import { DataSource } from 'typeorm';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { GetWorkspacesQueryDto } from '../dto/get-workspaces-query.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
import { WorkspaceAccessService } from './workspace-access.service';
export declare class WorkspacesService {
    private readonly dataSource;
    private readonly workspacesRepository;
    private readonly workspaceMembersRepository;
    private readonly workspaceAccessService;
    constructor(dataSource: DataSource, workspacesRepository: WorkspacesRepository, workspaceMembersRepository: WorkspaceMembersRepository, workspaceAccessService: WorkspaceAccessService);
    createWorkspace(userId: string, dto: CreateWorkspaceDto): Promise<{
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
                updatedAt: Date;
            };
        };
    }>;
    getMyWorkspaces(userId: string, query: GetWorkspacesQueryDto): Promise<{
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
                updatedAt: Date;
            }[];
        };
    }>;
    getWorkspaceDetail(userId: string, workspaceId: string): Promise<{
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
    updateWorkspace(userId: string, workspaceId: string, dto: UpdateWorkspaceDto): Promise<{
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
                updatedAt: Date;
            };
        };
    }>;
    archiveWorkspace(userId: string, workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    private createUniqueSlug;
    private findWorkspaceOrFail;
    private toWorkspaceResponse;
}
