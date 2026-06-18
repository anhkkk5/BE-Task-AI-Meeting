import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';
export declare class Project {
    id: string;
    workspaceId: string;
    name: string;
    keyCode: string;
    description: string | null;
    status: ProjectStatus;
    startDate: string | null;
    endDate: string | null;
    createdBy: string;
    workspace: Workspace;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
