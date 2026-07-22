import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { UsersService } from '../../users/services/users.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';

export type PersonalReportInputData = {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
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
  dailyUpdate: {
    id: string;
    updateDate: string;
    yesterdayWork: string;
    todayPlan: string;
    blockers: string | null;
    notes: string | null;
    mood: string | null;
  } | null;
  tasks: {
    id: string;
    taskCode: string;
    title: string;
    status: string;
    sprintId: string | null;
    dueDate: string | null;
    estimatedHours: number | null;
    storyPoints: number | null;
  }[];
  taskSummary: {
    completed: string[];
    inProgress: string[];
    overdue: string[];
  };
};

type BuildInputParams = {
  workspaceId: string;
  projectId: string;
  targetUserId: string;
  reportDate: string;
  sprintId?: string;
};

@Injectable()
export class AiReportDataBuilderService {
  constructor(
    private readonly dailyUpdatesRepository: DailyUpdatesRepository,
    private readonly projectAccessService: ProjectAccessService,
    private readonly sprintAccessService: SprintAccessService,
    private readonly tasksRepository: TasksRepository,
    private readonly usersService: UsersService,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async buildPersonalDailyReportInput(params: BuildInputParams) {
    const workspace = await this.workspaceAccessService.assertWorkspaceActive(
      params.workspaceId,
    );
    const targetMember =
      await this.workspaceAccessService.assertWorkspaceMember(
        params.targetUserId,
        params.workspaceId,
      );
    const user = await this.usersService.findById(params.targetUserId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

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
    const dailyUpdates = await this.dailyUpdatesRepository.findMy(
      params.projectId,
      params.targetUserId,
      {
        date: reportDate,
        sprintId: params.sprintId,
        page: 1,
        limit: 1,
      },
    );
    const tasks = await this.tasksRepository.findByProject(params.projectId, {
      assigneeId: params.targetUserId,
      sprintId: params.sprintId,
      page: 1,
      limit: 100,
    });
    const normalizedTasks = tasks.items.map((task) => ({
      id: task.id,
      taskCode: task.taskCode,
      title: task.title,
      status: task.status,
      sprintId: task.sprintId,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      storyPoints: task.storyPoints,
    }));

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: targetMember.role,
      },
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
      dailyUpdate: dailyUpdates.items[0]
        ? {
            id: dailyUpdates.items[0].id,
            updateDate: dailyUpdates.items[0].updateDate,
            yesterdayWork: dailyUpdates.items[0].yesterdayWork,
            todayPlan: dailyUpdates.items[0].todayPlan,
            blockers: dailyUpdates.items[0].blockers,
            notes: dailyUpdates.items[0].notes,
            mood: dailyUpdates.items[0].mood,
          }
        : null,
      tasks: normalizedTasks,
      taskSummary: {
        completed: normalizedTasks
          .filter((task) => task.status === TaskStatus.Done)
          .map((task) => `${task.taskCode} - ${task.title}`),
        inProgress: normalizedTasks
          .filter((task) =>
            [TaskStatus.InProgress, TaskStatus.Review].includes(task.status),
          )
          .map((task) => `${task.taskCode} - ${task.title}`),
        overdue: normalizedTasks
          .filter(
            (task) =>
              Boolean(task.dueDate) &&
              task.dueDate! < reportDate &&
              ![TaskStatus.Done, TaskStatus.Cancelled].includes(task.status),
          )
          .map((task) => `${task.taskCode} - ${task.title}`),
      },
    } satisfies PersonalReportInputData;
  }

  private normalizeDate(value: string) {
    return value.slice(0, 10);
  }
}
