import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { AddMemberDto } from '../dto/add-member.dto';
import { ChangeMemberRoleDto } from '../dto/change-member-role.dto';
import { MembersService } from '../services/members.service';
export declare class MembersController {
    private readonly membersService;
    constructor(membersService: MembersService);
    getMembers(user: AuthUser, workspaceId: string): Promise<{
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
                status: import("../../../common/enums/workspace-member-status.enum").WorkspaceMemberStatus;
                joinedAt: Date | null;
            }[];
        };
    }>;
    getMyRole(user: AuthUser, workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            workspaceId: string;
            userId: string;
            role: WorkspaceRole;
            status: import("../../../common/enums/workspace-member-status.enum").WorkspaceMemberStatus;
        };
    }>;
    addMember(user: AuthUser, workspaceId: string, dto: AddMemberDto): Promise<{
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
                status: import("../../../common/enums/workspace-member-status.enum").WorkspaceMemberStatus;
                joinedAt: Date | null;
            };
        };
    }>;
    changeMemberRole(user: AuthUser, workspaceId: string, memberId: string, dto: ChangeMemberRoleDto): Promise<{
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
                status: import("../../../common/enums/workspace-member-status.enum").WorkspaceMemberStatus;
                joinedAt: Date | null;
            };
        };
    }>;
    removeMember(user: AuthUser, workspaceId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
