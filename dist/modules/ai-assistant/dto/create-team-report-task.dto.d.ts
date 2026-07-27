import { TeamReportActionItemSource } from '../../../common/enums/team-report-action-item-status.enum';
export declare class CreateTeamReportTaskDto {
    source: TeamReportActionItemSource;
    itemIndex: number;
    title?: string;
    assigneeId?: string;
    sprintId?: string;
    dueDate?: string;
}
