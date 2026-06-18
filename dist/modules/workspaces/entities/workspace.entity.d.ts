import { WorkspacePlan } from '../../../common/enums/workspace-plan.enum';
import { WorkspaceStatus } from '../../../common/enums/workspace-status.enum';
import { WorkspaceMember } from './workspace-member.entity';
export declare class Workspace {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    ownerId: string;
    plan: WorkspacePlan;
    status: WorkspaceStatus;
    members: WorkspaceMember[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
