import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { Task } from '../../tasks/entities/task.entity';
import { GetSprintsQueryDto } from '../dto/get-sprints-query.dto';
import { Sprint } from '../entities/sprint.entity';

@Injectable()
export class SprintsRepository {
  constructor(
    @InjectRepository(Sprint)
    private readonly repository: Repository<Sprint>,
    private readonly dataSource: DataSource,
  ) {}

  create(
    data: Pick<
      Sprint,
      'createdBy' | 'endDate' | 'goal' | 'name' | 'projectId' | 'startDate'
    >,
  ) {
    const sprint = this.repository.create({
      ...data,
      status: SprintStatus.Planned,
      startedAt: null,
      completedAt: null,
    });

    return this.repository.save(sprint);
  }

  findByIdAndProject(sprintId: string, projectId: string) {
    return this.repository.findOne({
      where: {
        id: sprintId,
        projectId,
        deletedAt: IsNull(),
      },
    });
  }

  findActiveByProject(projectId: string) {
    return this.repository.findOne({
      where: {
        projectId,
        status: SprintStatus.Active,
        deletedAt: IsNull(),
      },
    });
  }

  async findByProject(projectId: string, query: GetSprintsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.repository
      .createQueryBuilder('sprint')
      .where('sprint.projectId = :projectId', { projectId })
      .andWhere('sprint.deletedAt IS NULL');

    if (query.status) {
      builder.andWhere('sprint.status = :status', { status: query.status });
    }

    if (query.keyword?.trim()) {
      const keyword = `%${query.keyword.trim()}%`;
      builder.andWhere(
        '(sprint.name LIKE :keyword OR sprint.goal LIKE :keyword)',
        { keyword },
      );
    }

    const [items, total] = await builder
      .orderBy('sprint.startDate', 'ASC')
      .addOrderBy('sprint.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async update(sprint: Sprint, data: Partial<Sprint>) {
    Object.assign(sprint, data);
    return this.repository.save(sprint);
  }

  async softDeleteWithTasks(sprint: Sprint) {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(Task)
        .update({ sprintId: sprint.id }, { sprintId: null });
      await manager.getRepository(Sprint).softRemove(sprint);
    });
  }
}
