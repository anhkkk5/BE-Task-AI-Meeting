import { TeamReportActionItemSource } from '../../../common/enums/team-report-action-item-status.enum';
export declare class RequestTeamReportHandoverDto {
    source: TeamReportActionItemSource;
    itemIndex: number;
    taskId: string;
    suggestedReceiverId: string;
    note?: string;
}
