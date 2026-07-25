import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceMemberStatus } from '../../../common/enums/workspace-member-status.enum';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { Project } from '../../projects/entities/project.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { Task } from '../../tasks/entities/task.entity';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';

export type GroupedCount = {
  workspaceId: string;
  total: string;
};

export type StatusCount = {
  status: string;
  total: string;
};

export type DailyCount = {
  day: string;
  total: string;
};

/**
 * Tap trung cac aggregate query cho module stats.
 * Moi ham chi tra ve so dem tho, viec map sang response nam o StatsService.
 */
@Injectable()
export class StatsRepository {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMembersRepository: Repository<WorkspaceMember>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Sprint)
    private readonly sprintsRepository: Repository<Sprint>,
    @InjectRepository(Meeting)
    private readonly meetingsRepository: Repository<Meeting>,
  ) {}

  /** Dem project chua xoa theo tung workspace, chi 1 query duy nhat. */
  countProjectsByWorkspace(workspaceIds: string[]) {
    return this.projectsRepository
      .createQueryBuilder('project')
      .select('project.workspaceId', 'workspaceId')
      .addSelect('COUNT(project.id)', 'total')
      .where('project.workspaceId IN (:...workspaceIds)', { workspaceIds })
      .andWhere('project.deletedAt IS NULL')
      .groupBy('project.workspaceId')
      .getRawMany<GroupedCount>();
  }

  /** Dem member ACTIVE theo tung workspace. */
  countMembersByWorkspace(workspaceIds: string[]) {
    return this.workspaceMembersRepository
      .createQueryBuilder('member')
      .select('member.workspaceId', 'workspaceId')
      .addSelect('COUNT(member.id)', 'total')
      .where('member.workspaceId IN (:...workspaceIds)', { workspaceIds })
      .andWhere('member.status = :status', {
        status: WorkspaceMemberStatus.Active,
      })
      .groupBy('member.workspaceId')
      .getRawMany<GroupedCount>();
  }

  /**
   * Dem task theo tung workspace.
   * Task khong luu workspaceId nen phai join qua project de lay duoc.
   */
  countTasksByWorkspace(workspaceIds: string[]) {
    return this.tasksRepository
      .createQueryBuilder('task')
      .innerJoin('task.project', 'project')
      .select('project.workspaceId', 'workspaceId')
      .addSelect('COUNT(task.id)', 'total')
      .where('project.workspaceId IN (:...workspaceIds)', { workspaceIds })
      .andWhere('task.deletedAt IS NULL')
      .andWhere('project.deletedAt IS NULL')
      .groupBy('project.workspaceId')
      .getRawMany<GroupedCount>();
  }

  /** Dem meeting theo tung workspace. */
  countMeetingsByWorkspace(workspaceIds: string[]) {
    return this.meetingsRepository
      .createQueryBuilder('meeting')
      .select('meeting.workspaceId', 'workspaceId')
      .addSelect('COUNT(meeting.id)', 'total')
      .where('meeting.workspaceId IN (:...workspaceIds)', { workspaceIds })
      .andWhere('meeting.deletedAt IS NULL')
      .groupBy('meeting.workspaceId')
      .getRawMany<GroupedCount>();
  }

  /**
   * Dem so nguoi khac nhau trong tat ca workspace cua user.
   * Dung DISTINCT de mot nguoi tham gia nhieu workspace khong bi cong trung.
   */
  async countDistinctMembers(workspaceIds: string[]) {
    const raw = await this.workspaceMembersRepository
      .createQueryBuilder('member')
      .select('COUNT(DISTINCT member.userId)', 'total')
      .where('member.workspaceId IN (:...workspaceIds)', { workspaceIds })
      .andWhere('member.status = :status', {
        status: WorkspaceMemberStatus.Active,
      })
      .getRawOne<{ total: string }>();

    return Number(raw?.total ?? 0);
  }

  /** Dem project trong 1 workspace, nhom theo status. */
  countProjectsByStatus(workspaceId: string) {
    return this.projectsRepository
      .createQueryBuilder('project')
      .select('project.status', 'status')
      .addSelect('COUNT(project.id)', 'total')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere('project.deletedAt IS NULL')
      .groupBy('project.status')
      .getRawMany<StatusCount>();
  }

  /** Dem task trong 1 workspace, nhom theo status. */
  countTasksByStatus(workspaceId: string) {
    return this.tasksRepository
      .createQueryBuilder('task')
      .innerJoin('task.project', 'project')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'total')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.deletedAt IS NULL')
      .andWhere('project.deletedAt IS NULL')
      .groupBy('task.status')
      .getRawMany<StatusCount>();
  }

  /** Sprint dang chay gan nhat cua workspace. */
  findActiveSprint(workspaceId: string) {
    return this.sprintsRepository
      .createQueryBuilder('sprint')
      .innerJoinAndSelect('sprint.project', 'project')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere('sprint.status = :status', { status: SprintStatus.Active })
      .andWhere('sprint.deletedAt IS NULL')
      .andWhere('project.deletedAt IS NULL')
      .orderBy('sprint.startDate', 'DESC')
      .getOne();
  }

  /** Dem task cua 1 sprint theo status, dung de tinh tien do sprint. */
  countSprintTasksByStatus(sprintId: string) {
    return this.tasksRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'total')
      .where('task.sprintId = :sprintId', { sprintId })
      .andWhere('task.deletedAt IS NULL')
      .groupBy('task.status')
      .getRawMany<StatusCount>();
  }

  /**
   * Cac task co deadline gan nhat va chua ket thuc.
   * Dung limit thay take vi chi join ManyToOne nen khong bi nhan ban dong.
   */
  findUpcomingTasks(workspaceId: string, limit: number) {
    return this.tasksRepository
      .createQueryBuilder('task')
      .innerJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.dueDate IS NOT NULL')
      .andWhere('task.status NOT IN (:...closedStatuses)', {
        closedStatuses: [TaskStatus.Done, TaskStatus.Cancelled],
      })
      .andWhere('task.deletedAt IS NULL')
      .andWhere('project.deletedAt IS NULL')
      .orderBy('task.dueDate', 'ASC')
      .limit(limit)
      .getMany();
  }

  /**
   * Dem task DONE theo tung ngay ke tu fromDate, dung cho bieu do productivity.
   * Dua vao updatedAt vi he thong chua luu completedAt rieng cho task.
   * DATE() giu ten cot that vi TypeORM khong dich ten nam trong ham SQL.
   */
  countCompletedTasksByDay(workspaceId: string, fromDate: Date) {
    return this.tasksRepository
      .createQueryBuilder('task')
      .innerJoin('task.project', 'project')
      .select('DATE(task.updated_at)', 'day')
      .addSelect('COUNT(task.id)', 'total')
      .where('project.workspace_id = :workspaceId', { workspaceId })
      .andWhere('task.status = :status', { status: TaskStatus.Done })
      .andWhere('task.updated_at >= :fromDate', { fromDate })
      .andWhere('task.deletedAt IS NULL')
      .andWhere('project.deletedAt IS NULL')
      .groupBy('DATE(task.updated_at)')
      .getRawMany<DailyCount>();
  }

  /** Dem meeting tu hom nay tro di cua workspace. */
  async countUpcomingMeetings(workspaceId: string, fromDate: string) {
    const raw = await this.meetingsRepository
      .createQueryBuilder('meeting')
      .select('COUNT(meeting.id)', 'total')
      .where('meeting.workspace_id = :workspaceId', { workspaceId })
      .andWhere('meeting.meeting_date >= :fromDate', { fromDate })
      .andWhere('meeting.deletedAt IS NULL')
      .getRawOne<{ total: string }>();

    return Number(raw?.total ?? 0);
  }
}
