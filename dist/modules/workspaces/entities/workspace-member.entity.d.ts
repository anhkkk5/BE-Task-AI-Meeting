import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { User } from '../../users/entities/user.entity';
import { Workspace } from './workspace.entity';
export declare class WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
    status: WorkspaceMemberStatus;
    joinedAt: Date | null;
    workspace: Workspace;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
