import { TaskStatus } from '../enums/task-status.enum';
import { WorkspaceRole } from '../enums/workspace-role.enum';
export type WorkflowStatusConfig = {
    workflowStatusId?: string;
    key: TaskStatus;
    label: string;
    color: string;
    category: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
    order: number;
    enabled: boolean;
};
export type WorkflowTransitionConfig = {
    from: TaskStatus;
    to: TaskStatus;
    roles?: WorkspaceRole[];
};
export declare const DEFAULT_WORKFLOW_STATUSES: WorkflowStatusConfig[];
export declare const DEFAULT_WORKFLOW_TRANSITIONS: WorkflowTransitionConfig[];
