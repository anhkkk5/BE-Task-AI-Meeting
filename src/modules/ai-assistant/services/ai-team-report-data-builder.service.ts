import { Injectable } from '@nestjs/common';
import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { ShiftHandoversRepository } from '../../shift-handovers/repositories/shift-handovers.repository';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';

type TeamMemberInput = {
  userId: string;
  fullName: string;
  email: string | null;
  role: string;
};

type TeamDailyUpdateInput = {
  id: string;
  userId: string;
  fullName: string;
  updateDate: string;
  yesterdayWork: string;
  todayPlan: string;
  blockers: string | null;
  notes: string | null;
  mood: string | null;
};

type TeamTaskInput = {
  id: string;
  taskCode: string;
  title: string;
  status: string;
  sprintId: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  storyPoints: number | null;
};

type TeamHandoverInput = {
  id: string;
  taskCode: string | null;
  taskTitle: string | null;
  status: string;
  senderName: string | null;
  receiverName: string | null;
  completedWork: string | null;
  remainingWork: string | null;
  blockers: string | null;
};

export type TeamReportInputData = {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  project: {
    id: string;
    name: string;
    keyCode: string;
    status: string;
  };
  sprint: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null;
  reportDate: string;
  members: TeamMemberInput[];
  dailyUpdates: TeamDailyUpdateInput[];
  missingDailyUpdateMembers: TeamMemberInput[];
  taskStats: Record<TaskStatus, number>;
  tasks: TeamTaskInput[];
  overdueTasks: TeamTaskInput[];
  blockers: {
    userId: string;
    fullName: string;
    blocker: string;
  }[];
  /**
   * Ban giao cong viec trong ngay cua ca doi. Thieu du lieu nay thi bao cao
   * giao ban se bo qua viec da chuyen tay va khong thay duoc diem tac nghen.
   */
  handovers: TeamHandoverInput[];
  handoverStats: {
    total: number;
    acknowledged: number;
    pending: number;
    changesRequested: number;
    rejected: number;
  };
};

type BuildTeamInputParams = {
  workspaceId: string;
  projectId: string;
  reportDate: string;
  sprintId?: string;
};

@Injectable()
export class AiTeamReportDataBuilderService {
  constructor(
    private readonly dailyUpdatesRepository: DailyUpdatesRepository,
    private readonly projectAccessService: ProjectAccessService,
    private readonly sprintAccessService: SprintAccessService,
    private readonly tasksRepository: TasksRepository,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly shiftHandoversRepository: ShiftHandoversRepository,
  ) {}

  async buildTeamReportInput(params: BuildTeamInputParams) {
    const workspace = await this.workspaceAccessService.assertWorkspaceActive(
      params.workspaceId,
    );
    const project = await this.projectAccessService.assertProjectInWorkspace(
      params.projectId,
      params.workspaceId,
    );
    const sprint = params.sprintId
      ? await this.sprintAccessService.assertSprintInProject(
          params.sprintId,
          params.projectId,
        )
      : null;
    const reportDate = this.normalizeDate(params.reportDate);
    const members = await this.getTeamMembers(params.workspaceId);
    const dailyUpdates = await this.getTeamDailyUpdates(
      params.projectId,
      reportDate,
      params.sprintId,
    );
    const tasks = await this.getTeamTasks(params.projectId, params.sprintId);
    const handovers = await this.getTeamHandovers(params.projectId, reportDate);

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      project: {
        id: project.id,
        name: project.name,
        keyCode: project.keyCode,
        status: project.status,
      },
      sprint: sprint
        ? {
            id: sprint.id,
            name: sprint.name,
            status: sprint.status,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
          }
        : null,
      reportDate,
      members,
      dailyUpdates,
      missingDailyUpdateMembers: this.getMissingDailyUpdateMembers(
        members,
        dailyUpdates,
      ),
      taskStats: this.getTaskStats(tasks),
      tasks,
      overdueTasks: this.getOverdueTasks(tasks, reportDate),
      blockers: dailyUpdates
        .filter((dailyUpdate) => Boolean(dailyUpdate.blockers?.trim()))
        .map((dailyUpdate) => ({
          userId: dailyUpdate.userId,
          fullName: dailyUpdate.fullName,
          blocker: dailyUpdate.blockers?.trim() ?? '',
        })),
      handovers,
      handoverStats: this.getHandoverStats(handovers),
    } satisfies TeamReportInputData;
  }

  /** Ban giao trong ngay cua project, rut gon cho prompt AI. */
  async getTeamHandovers(projectId: string, reportDate: string) {
    const handovers = await this.shiftHandoversRepository.findByProjectAndDate(
      projectId,
      reportDate,
    );

    return handovers.map((handover) => ({
      id: handover.id,
      taskCode: handover.task?.taskCode ?? null,
      taskTitle: handover.task?.title ?? null,
      status: handover.status,
      senderName: handover.sender?.fullName ?? null,
      receiverName: handover.receiver?.fullName ?? null,
      completedWork: handover.completedWork ?? null,
      remainingWork: handover.remainingWork ?? null,
      blockers: handover.blockers ?? null,
    }));
  }

  /** Dem theo trang thai de AI biet co bao nhieu ban giao con treo. */
  private getHandoverStats(handovers: TeamHandoverInput[]) {
    const countByStatus = (status: HandoverStatus) =>
      handovers.filter((handover) => handover.status === status).length;

    return {
      total: handovers.length,
      acknowledged: countByStatus(HandoverStatus.Acknowledged),
      pending: countByStatus(HandoverStatus.Pending),
      changesRequested: countByStatus(HandoverStatus.ChangesRequested),
      rejected: countByStatus(HandoverStatus.Rejected),
    };
  }

  async getTeamMembers(workspaceId: string) {
    const members =
      await this.workspaceMembersRepository.findActiveByWorkspace(workspaceId);

    return members.map((member) => ({
      userId: member.userId,
      fullName: member.user?.fullName ?? member.user?.email ?? member.userId,
      email: member.user?.email ?? null,
      role: member.role,
    }));
  }

  async getTeamDailyUpdates(
    projectId: string,
    reportDate: string,
    sprintId?: string,
  ) {
    const result = await this.dailyUpdatesRepository.findTeam(projectId, {
      date: reportDate,
      sprintId,
      page: 1,
      limit: 100,
    });

    return result.items.map((dailyUpdate) => ({
      id: dailyUpdate.id,
      userId: dailyUpdate.userId,
      fullName:
        dailyUpdate.user?.fullName ??
        dailyUpdate.user?.email ??
        dailyUpdate.userId,
      updateDate: dailyUpdate.updateDate,
      yesterdayWork: dailyUpdate.yesterdayWork,
      todayPlan: dailyUpdate.todayPlan,
      blockers: dailyUpdate.blockers,
      notes: dailyUpdate.notes,
      mood: dailyUpdate.mood,
    }));
  }

  async getTeamTasks(projectId: string, sprintId?: string) {
    const result = await this.tasksRepository.findByProject(projectId, {
      sprintId,
      page: 1,
      limit: 100,
    });

    return result.items.map((task) => ({
      id: task.id,
      taskCode: task.taskCode,
      title: task.title,
      status: task.status,
      sprintId: task.sprintId,
      assigneeId: task.assigneeId,
      assigneeName:
        task.assignee?.fullName ?? task.assignee?.email ?? task.assigneeId,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      storyPoints: task.storyPoints,
    }));
  }

  getTaskStats(tasks: TeamTaskInput[]) {
    const stats = {
      [TaskStatus.Backlog]: 0,
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Review]: 0,
      [TaskStatus.Done]: 0,
      [TaskStatus.Cancelled]: 0,
    };

    tasks.forEach((task) => {
      stats[task.status as TaskStatus] =
        (stats[task.status as TaskStatus] ?? 0) + 1;
    });

    return stats;
  }

  getOverdueTasks(tasks: TeamTaskInput[], reportDate: string) {
    return tasks.filter(
      (task) =>
        Boolean(task.dueDate) &&
        task.dueDate! < reportDate &&
        ![TaskStatus.Done, TaskStatus.Cancelled].includes(
          task.status as TaskStatus,
        ),
    );
  }

  getMissingDailyUpdateMembers(
    members: TeamMemberInput[],
    dailyUpdates: TeamDailyUpdateInput[],
  ) {
    const updatedUserIds = new Set(
      dailyUpdates.map((dailyUpdate) => dailyUpdate.userId),
    );

    return members.filter((member) => !updatedUserIds.has(member.userId));
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }
}
