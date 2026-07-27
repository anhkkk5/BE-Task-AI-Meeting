import { Repository } from 'typeorm';
import { TeamReportActionItemSource } from '../../../common/enums/team-report-action-item-status.enum';
import { TeamReportActionItem } from '../entities/team-report-action-item.entity';
export declare class TeamReportActionItemsRepository {
    private readonly items;
    constructor(items: Repository<TeamReportActionItem>);
    findByReport(reportId: string): Promise<TeamReportActionItem[]>;
    findOne(reportId: string, source: TeamReportActionItemSource, itemIndex: number): Promise<TeamReportActionItem | null>;
    save(data: Partial<TeamReportActionItem>): Promise<TeamReportActionItem>;
}
