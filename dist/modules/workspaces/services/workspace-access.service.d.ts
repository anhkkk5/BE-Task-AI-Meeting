import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
export declare class WorkspaceAccessService {
    private readonly workspacesRepository;
    private readonly workspaceMembersRepository;
    constructor(workspacesRepository: WorkspacesRepository, workspaceMembersRepository: WorkspaceMembersRepository);
    getUserWorkspaceRole(userId: string, workspaceId: string): Promise<WorkspaceRole | null>;
    isWorkspaceMember(userId: string, workspaceId: string): Promise<boolean>;
    assertWorkspaceMember(userId: string, workspaceId: string): Promise<import("../entities/workspace-member.entity").WorkspaceMember>;
    assertWorkspaceOwner(userId: string, workspaceId: string): Promise<import("../entities/workspace-member.entity").WorkspaceMember>;
    assertWorkspaceActive(workspaceId: string): Promise<import("../entities/workspace.entity").Workspace>;
}
