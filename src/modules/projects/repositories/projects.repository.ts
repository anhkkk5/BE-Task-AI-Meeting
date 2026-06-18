import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { Project } from '../entities/project.entity';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
  ) {}

  create(
    data: Pick<
      Project,
      | 'createdBy'
      | 'description'
      | 'endDate'
      | 'keyCode'
      | 'name'
      | 'startDate'
      | 'workspaceId'
    >,
  ) {
    const project = this.repository.create(data);
    return this.repository.save(project);
  }

  findByWorkspaceAndKeyCode(workspaceId: string, keyCode: string) {
    return this.repository.findOne({
      where: {
        workspaceId,
        keyCode,
        deletedAt: IsNull(),
      },
    });
  }

  findByIdAndWorkspace(projectId: string, workspaceId: string) {
    return this.repository.findOne({
      where: {
        id: projectId,
        workspaceId,
        deletedAt: IsNull(),
      },
    });
  }

  async findByWorkspace(workspaceId: string, query: GetProjectsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.repository
      .createQueryBuilder('project')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere('project.deletedAt IS NULL');

    if (query.status) {
      builder.andWhere('project.status = :status', { status: query.status });
    }

    if (query.keyword?.trim()) {
      const keyword = `%${query.keyword.trim()}%`;
      builder.andWhere(
        '(project.name LIKE :keyword OR project.keyCode LIKE :keyword)',
        { keyword },
      );
    }

    const [items, total] = await builder
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async update(project: Project, data: Partial<Project>) {
    Object.assign(project, data);
    return this.repository.save(project);
  }

  async archive(project: Project) {
    await this.repository.update(project.id, {
      status: ProjectStatus.Archived,
    });
  }

  async complete(project: Project) {
    await this.repository.update(project.id, {
      status: ProjectStatus.Completed,
    });
  }
}
