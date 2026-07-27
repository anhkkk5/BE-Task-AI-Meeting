import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamReportActionItemSource } from '../../../common/enums/team-report-action-item-status.enum';
import { TeamReportActionItem } from '../entities/team-report-action-item.entity';

@Injectable()
export class TeamReportActionItemsRepository {
  constructor(
    @InjectRepository(TeamReportActionItem)
    private readonly items: Repository<TeamReportActionItem>,
  ) {}

  findByReport(reportId: string) {
    return this.items.find({
      where: { reportId },
      order: { source: 'ASC', itemIndex: 'ASC' },
    });
  }

  findOne(
    reportId: string,
    source: TeamReportActionItemSource,
    itemIndex: number,
  ) {
    return this.items.findOne({ where: { reportId, source, itemIndex } });
  }

  save(data: Partial<TeamReportActionItem>) {
    return this.items.save(this.items.create(data));
  }
}
