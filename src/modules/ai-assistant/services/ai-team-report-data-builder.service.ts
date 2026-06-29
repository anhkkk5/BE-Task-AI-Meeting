import { Injectable } from '@nestjs/common';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
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
  priority: string;
  sprintId: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  storyPoints: number | null;
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
  highPriorityTasks: TeamTaskInput[];
  blockers: {
    userId: string;
    fullName: string;
    blocker: string;
  }[];
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
      highPriorityTasks: tasks.filter((task) =>
        [TaskPriority.High, TaskPriority.Urgent].includes(task.priority),
      ),
      blockers: dailyUpdates
        .filter((dailyUpdate) => Boolean(dailyUpdate.blockers?.trim()))
        .map((dailyUpdate) => ({
          userId: dailyUpdate.userId,
          fullName: dailyUpdate.fullName,
          blocker: dailyUpdate.blockers?.trim() ?? '',
        })),
    } satisfies TeamReportInputData;
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
      priority: task.priority,
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
