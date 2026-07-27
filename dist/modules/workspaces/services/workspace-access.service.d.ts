import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceMembersRepository } from '../repositories/workspace-members.repository';
import { WorkspacesRepository } from '../repositories/workspaces.repository';
type MembershipSnapshot = {
    role: WorkspaceRole;
    status: WorkspaceMemberStatus;
};
export declare class WorkspaceAccessService {
    private readonly workspacesRepository;
    private readonly workspaceMembersRepository;
    private readonly membershipCache;
    constructor(workspacesRepository: WorkspacesRepository, workspaceMembersRepository: WorkspaceMembersRepository);
    getMembershipSnapshot(userId: string, workspaceId: string): Promise<MembershipSnapshot | null>;
    getUserWorkspaceRole(userId: string, workspaceId: string): Promise<WorkspaceRole | null>;
    isWorkspaceMember(userId: string, workspaceId: string): Promise<boolean>;
    assertWorkspaceMembership(userId: string, workspaceId: string): Promise<MembershipSnapshot>;
    assertWorkspaceMember(userId: string, workspaceId: string): Promise<import("../entities/workspace-member.entity").WorkspaceMember>;
    assertWorkspaceOwner(userId: string, workspaceId: string): Promise<import("../entities/workspace-member.entity").WorkspaceMember>;
    assertWorkspaceActive(workspaceId: string): Promise<import("../entities/workspace.entity").Workspace>;
    invalidateMembership(userId: string, workspaceId: string): void;
    private buildMembershipCacheKey;
    private writeCache;
    private evictExpiredEntries;
}
export {};
