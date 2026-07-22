import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AddMemberDto } from '../dto/add-member.dto';
import { ChangeMemberRoleDto } from '../dto/change-member-role.dto';
export declare class MembersService {
    private readonly usersService;
    private readonly workspaceAccessService;
    private readonly workspaceMembersRepository;
    constructor(usersService: UsersService, workspaceAccessService: WorkspaceAccessService, workspaceMembersRepository: WorkspaceMembersRepository);
    getMembers(currentUserId: string, workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                memberId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: WorkspaceRole;
                status: WorkspaceMemberStatus;
                joinedAt: Date | null;
            }[];
        };
    }>;
    addMember(currentUserId: string, workspaceId: string, dto: AddMemberDto): Promise<{
        success: boolean;
        message: string;
        data: {
            member: {
                memberId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: WorkspaceRole;
                status: WorkspaceMemberStatus;
                joinedAt: Date | null;
            };
        };
    }>;
    lookupMember(currentUserId: string, workspaceId: string, email: string): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                fullName: string;
                avatarUrl: string | null;
                jobTitle: string | null;
                status: UserStatus;
            } | null;
            existingMember: {
                memberId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: WorkspaceRole;
                status: WorkspaceMemberStatus;
                joinedAt: Date | null;
            } | null;
            canAdd: boolean;
            reason: string | null;
        };
    }>;
    changeMemberRole(currentUserId: string, workspaceId: string, memberId: string, dto: ChangeMemberRoleDto): Promise<{
        success: boolean;
        message: string;
        data: {
            member: {
                memberId: string;
                userId: string;
                fullName: string;
                email: string;
                avatarUrl: string | null;
                role: WorkspaceRole;
                status: WorkspaceMemberStatus;
                joinedAt: Date | null;
            };
        };
    }>;
    removeMember(currentUserId: string, workspaceId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getMyRole(currentUserId: string, workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            workspaceId: string;
            userId: string;
            role: WorkspaceRole;
            status: WorkspaceMemberStatus;
        };
    }>;
    private findMemberOrFail;
    private assertNotLastOwner;
    private toMemberResponse;
    private lookupResponse;
    private toUserLookupResponse;
}
