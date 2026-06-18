import { WorkspaceRole } from '../enums/workspace-role.enum';
export declare const WORKSPACE_ROLES_KEY = "workspace_roles";
export declare const WorkspaceRoles: (...roles: WorkspaceRole[]) => import("@nestjs/common").CustomDecorator<string>;
