import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { Project } from '../entities/project.entity';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';
import { Task } from '../../tasks/entities/task.entity';
import { TaskStatus } from '../../../common/enums/task-status.enum';

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

  findByIdAndWorkspace(projectId: string, workspaceId: string) {
    return this.repository.findOne({
      where: {
        id: projectId,
        workspaceId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Ban chi tiet co kem nguoi tao.
   *
   * Tach khoi findByIdAndWorkspace vi ham do duoc goi o rat nhieu luong chi can
   * kiem tra quyen, khong can join sang bang users.
   */
  findDetailByIdAndWorkspace(projectId: string, workspaceId: string) {
    return this.repository.findOne({
      where: {
        id: projectId,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: { creator: true },
    });
  }

  /**
   * Lay cac key code dang dung trong workspace co cung tien to.
   *
   * Dung khi sinh key code tu dong: mot truy van roi doi chieu trong bo nho,
   * thay vi hoi database moi lan thu mot ung vien.
   *
   * Co tinh ca project da xoa mem vi unique index tren (workspace_id, key_code)
   * khong loai tru dong da xoa.
   */
  async findKeyCodesByPrefix(workspaceId: string, prefix: string) {
    const rows = await this.repository
      .createQueryBuilder('project')
      .select('project.keyCode', 'keyCode')
      .withDeleted()
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere('project.keyCode LIKE :prefix', { prefix: `${prefix}%` })
      .getRawMany<{ keyCode: string }>();

    return rows.map((row) => row.keyCode);
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

  async countTasksByProjects(projectIds: string[]) {
    if (projectIds.length === 0) {
      return new Map<string, { totalTasks: number; completedTasks: number }>();
    }

    const rows = await this.repository.manager
      .createQueryBuilder(Task, 'task')
      .select('task.projectId', 'projectId')
      .addSelect('COUNT(task.id)', 'totalTasks')
      .addSelect(
        'SUM(CASE WHEN task.status = :doneStatus THEN 1 ELSE 0 END)',
        'completedTasks',
      )
      .where('task.projectId IN (:...projectIds)', { projectIds })
      .andWhere('task.deletedAt IS NULL')
      .setParameter('doneStatus', TaskStatus.Done)
      .groupBy('task.projectId')
      .getRawMany<{
        projectId: string;
        totalTasks: string;
        completedTasks: string;
      }>();

    return new Map(
      rows.map((row) => [
        row.projectId,
        {
          totalTasks: Number(row.totalTasks),
          completedTasks: Number(row.completedTasks),
        },
      ]),
    );
  }

  findActiveForAutomaticReports(reportDate: string) {
    return this.repository
      .createQueryBuilder('project')
      .where('project.status = :status', { status: ProjectStatus.Active })
      .andWhere('project.deletedAt IS NULL')
      .andWhere(
        '(project.startDate IS NULL OR project.startDate <= :reportDate)',
        {
          reportDate,
        },
      )
      .andWhere('(project.endDate IS NULL OR project.endDate >= :reportDate)', {
        reportDate,
      })
      .orderBy('project.createdAt', 'ASC')
      .getMany();
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
