import { Injectable } from '@nestjs/common';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import {
  GroupedCount,
  StatsRepository,
  StatusCount,
} from '../repositories/stats.repository';

const UPCOMING_TASK_LIMIT = 5;
const PRODUCTIVITY_DAYS = 7;

@Injectable()
export class StatsService {
  constructor(
    private readonly statsRepository: StatsRepository,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  /**
   * Tong hop so lieu cho trang danh sach workspace.
   * Chi dem trong cac workspace ma user dang la member ACTIVE.
   */
  async getWorkspacesOverview(userId: string) {
    const members =
      await this.workspaceMembersRepository.findActiveByUser(userId);
    const workspaceIds = members.map((member) => member.workspaceId);

    if (workspaceIds.length === 0) {
      return {
        success: true,
        message: 'Get workspaces overview successfully',
        data: {
          summary: {
            workspaces: 0,
            projects: 0,
            members: 0,
            meetings: 0,
            tasks: 0,
          },
          workspaces: [],
        },
      };
    }

    const [
      projectCounts,
      memberCounts,
      taskCounts,
      meetingCounts,
      distinctMembers,
    ] = await Promise.all([
      this.statsRepository.countProjectsByWorkspace(workspaceIds),
      this.statsRepository.countMembersByWorkspace(workspaceIds),
      this.statsRepository.countTasksByWorkspace(workspaceIds),
      this.statsRepository.countMeetingsByWorkspace(workspaceIds),
      this.statsRepository.countDistinctMembers(workspaceIds),
    ]);

    const projectMap = this.toCountMap(projectCounts);
    const memberMap = this.toCountMap(memberCounts);
    const taskMap = this.toCountMap(taskCounts);
    const meetingMap = this.toCountMap(meetingCounts);

    const workspaces = members.map((member) => ({
      workspaceId: member.workspaceId,
      projectCount: projectMap.get(member.workspaceId) ?? 0,
      memberCount: memberMap.get(member.workspaceId) ?? 0,
      taskCount: taskMap.get(member.workspaceId) ?? 0,
      meetingCount: meetingMap.get(member.workspaceId) ?? 0,
      updatedAt: member.workspace?.updatedAt ?? null,
    }));

    return {
      success: true,
      message: 'Get workspaces overview successfully',
      data: {
        summary: {
          workspaces: workspaceIds.length,
          projects: this.sumMap(projectMap),
          members: distinctMembers,
          meetings: this.sumMap(meetingMap),
          tasks: this.sumMap(taskMap),
        },
        workspaces,
      },
    };
  }

  /** So lieu chi tiet cho dashboard cua 1 workspace. */
  async getWorkspaceDashboard(userId: string, workspaceId: string) {
    await this.workspaceAccessService.assertWorkspaceMember(
      userId,
      workspaceId,
    );

    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - (PRODUCTIVITY_DAYS - 1));
    fromDate.setHours(0, 0, 0, 0);

    const [
      projectStatusCounts,
      taskStatusCounts,
      members,
      activeSprint,
      upcomingTasks,
      completedByDay,
      upcomingMeetings,
    ] = await Promise.all([
      this.statsRepository.countProjectsByStatus(workspaceId),
      this.statsRepository.countTasksByStatus(workspaceId),
      this.workspaceMembersRepository.findActiveByWorkspace(workspaceId),
      this.statsRepository.findActiveSprint(workspaceId),
      this.statsRepository.findUpcomingTasks(workspaceId, UPCOMING_TASK_LIMIT),
      this.statsRepository.countCompletedTasksByDay(workspaceId, fromDate),
      this.statsRepository.countUpcomingMeetings(
        workspaceId,
        this.toDateOnly(today),
      ),
    ]);

    const projectStatusMap = this.toStatusMap(projectStatusCounts);
    const taskStatusMap = this.toStatusMap(taskStatusCounts);
    const totalTasks = this.sumMap(taskStatusMap);
    const doneTasks = taskStatusMap.get(TaskStatus.Done) ?? 0;

    const sprint = activeSprint
      ? await this.buildSprintProgress(activeSprint.id, {
          id: activeSprint.id,
          name: activeSprint.name,
          projectId: activeSprint.projectId,
          projectName: activeSprint.project?.name ?? null,
          startDate: activeSprint.startDate,
          endDate: activeSprint.endDate,
        })
      : null;

    return {
      success: true,
      message: 'Get workspace dashboard successfully',
      data: {
        summary: {
          totalProjects: this.sumMap(projectStatusMap),
          activeProjects: projectStatusMap.get(ProjectStatus.Active) ?? 0,
          completedProjects: projectStatusMap.get(ProjectStatus.Completed) ?? 0,
          totalTasks,
          doneTasks,
          totalMembers: members.length,
          upcomingMeetings,
          completionRate:
            totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
        },
        taskStatusBreakdown: Object.values(TaskStatus).map((status) => ({
          status,
          total: taskStatusMap.get(status) ?? 0,
        })),
        sprint,
        productivity: this.buildProductivitySeries(completedByDay, fromDate),
        upcomingTasks: upcomingTasks.map((task) => ({
          id: task.id,
          taskCode: task.taskCode,
          title: task.title,
          status: task.status,
          dueDate: task.dueDate,
          projectId: task.projectId,
          projectName: task.project?.name ?? null,
          assigneeName: task.assignee?.fullName ?? null,
        })),
        members: members.slice(0, 5).map((member) => ({
          id: member.id,
          userId: member.userId,
          role: member.role,
          fullName: member.user?.fullName ?? '',
          avatarUrl: member.user?.avatarUrl ?? null,
        })),
      },
    };
  }

  /** Tinh % hoan thanh cua sprint dang chay. */
  private async buildSprintProgress<T extends object>(
    sprintId: string,
    sprint: T,
  ) {
    const counts =
      await this.statsRepository.countSprintTasksByStatus(sprintId);
    const statusMap = this.toStatusMap(counts);
    const total = this.sumMap(statusMap);
    const done = statusMap.get(TaskStatus.Done) ?? 0;

    return {
      ...sprint,
      totalTasks: total,
      doneTasks: done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  }

  /**
   * Dung day du 7 ngay lien tiep, ngay khong co task DONE thi bang 0,
   * de bieu do o frontend khong bi khuyet cot.
   */
  private buildProductivitySeries(
    rows: { day: string | Date; total: string }[],
    fromDate: Date,
  ) {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      const day =
        row.day instanceof Date
          ? this.toDateOnly(row.day)
          : String(row.day).slice(0, 10);
      counts.set(day, Number(row.total));
    });

    return Array.from({ length: PRODUCTIVITY_DAYS }, (_, index) => {
      const date = new Date(fromDate);
      date.setDate(date.getDate() + index);
      const key = this.toDateOnly(date);

      return {
        date: key,
        completed: counts.get(key) ?? 0,
      };
    });
  }

  private toCountMap(rows: GroupedCount[]) {
    return new Map(rows.map((row) => [row.workspaceId, Number(row.total)]));
  }

  private toStatusMap(rows: StatusCount[]) {
    return new Map(rows.map((row) => [row.status, Number(row.total)]));
  }

  private sumMap(map: Map<string, number>) {
    let total = 0;
    map.forEach((value) => {
      total += value;
    });
    return total;
  }

  private toDateOnly(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
