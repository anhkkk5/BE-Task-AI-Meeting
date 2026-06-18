import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
export declare class ChangeMemberRoleDto {
    role: Exclude<WorkspaceRole, WorkspaceRole.Owner>;
}
