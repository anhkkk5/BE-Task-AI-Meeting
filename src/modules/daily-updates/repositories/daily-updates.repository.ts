import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetDailyUpdatesQueryDto } from '../dto/get-daily-updates-query.dto';
import { DailyUpdate } from '../entities/daily-update.entity';

@Injectable()
export class DailyUpdatesRepository {
  constructor(
    @InjectRepository(DailyUpdate)
    private readonly repository: Repository<DailyUpdate>,
  ) {}

  async create(
    data: Pick<
      DailyUpdate,
      | 'blockers'
      | 'mood'
      | 'needHelpFromId'
      | 'notes'
      | 'projectId'
      | 'sprintId'
      | 'todayPlan'
      | 'updateDate'
      | 'userId'
      | 'workspaceId'
      | 'yesterdayWork'
    >,
  ) {
    const dailyUpdate = this.repository.create(data);
    const savedDailyUpdate = await this.repository.save(dailyUpdate);

    return (
      (await this.findByIdAndProject(savedDailyUpdate.id, data.projectId)) ??
      savedDailyUpdate
    );
  }

  findDuplicate(
    workspaceId: string,
    projectId: string,
    userId: string,
    updateDate: string,
  ) {
    return this.repository.findOne({
      where: {
        workspaceId,
        projectId,
        userId,
        updateDate,
      },
      withDeleted: true,
    });
  }

  findByIdAndProject(dailyUpdateId: string, projectId: string) {
    return this.repository.findOne({
      where: {
        id: dailyUpdateId,
        projectId,
      },
      relations: {
        sprint: true,
        user: true,
        needHelpFrom: true,
      },
    });
  }

  findMy(projectId: string, userId: string, query: GetDailyUpdatesQueryDto) {
    return this.findByProject(projectId, query, { userId });
  }

  findTeam(projectId: string, query: GetDailyUpdatesQueryDto) {
    return this.findByProject(projectId, query, { userId: query.memberId });
  }

  async update(dailyUpdate: DailyUpdate, data: Partial<DailyUpdate>) {
    Object.assign(dailyUpdate, data);
    const savedDailyUpdate = await this.repository.save(dailyUpdate);

    return (
      (await this.findByIdAndProject(
        savedDailyUpdate.id,
        dailyUpdate.projectId,
      )) ?? savedDailyUpdate
    );
  }

  async archive(dailyUpdate: DailyUpdate) {
    await this.repository.softRemove(dailyUpdate);
  }

  private async findByProject(
    projectId: string,
    query: GetDailyUpdatesQueryDto,
    options: { userId?: string },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.repository
      .createQueryBuilder('dailyUpdate')
      .leftJoinAndSelect('dailyUpdate.user', 'user')
      .leftJoinAndSelect('dailyUpdate.sprint', 'sprint')
      .leftJoinAndSelect('dailyUpdate.needHelpFrom', 'needHelpFrom')
      .where('dailyUpdate.projectId = :projectId', { projectId })
      .andWhere('dailyUpdate.deletedAt IS NULL');

    if (options.userId) {
      builder.andWhere('dailyUpdate.userId = :userId', {
        userId: options.userId,
      });
    }

    if (query.sprintId) {
      builder.andWhere('dailyUpdate.sprintId = :sprintId', {
        sprintId: query.sprintId,
      });
    }

    if (query.date) {
      builder.andWhere('dailyUpdate.updateDate = :date', {
        date: this.normalizeDate(query.date),
      });
    } else {
      if (query.fromDate) {
        builder.andWhere('dailyUpdate.updateDate >= :fromDate', {
          fromDate: this.normalizeDate(query.fromDate),
        });
      }

      if (query.toDate) {
        builder.andWhere('dailyUpdate.updateDate <= :toDate', {
          toDate: this.normalizeDate(query.toDate),
        });
      }
    }

    const [items, total] = await builder
      .orderBy('dailyUpdate.updateDate', 'DESC')
      .addOrderBy('dailyUpdate.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }
}
