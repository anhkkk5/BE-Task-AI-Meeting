import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
export declare class AddMemberDto {
    email: string;
    role: Exclude<WorkspaceRole, WorkspaceRole.Owner>;
}
