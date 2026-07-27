import { TeamReportActionItemSource, TeamReportActionItemStatus } from '../../../common/enums/team-report-action-item-status.enum';
export declare class TeamReportActionItem {
    id: string;
    workspaceId: string;
    projectId: string;
    reportId: string;
    source: TeamReportActionItemSource;
    itemIndex: number;
    itemText: string;
    status: TeamReportActionItemStatus;
    createdTaskId: string | null;
    targetTaskId: string | null;
    suggestedReceiverId: string | null;
    handoverId: string | null;
    note: string | null;
    handledBy: string | null;
    handledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
