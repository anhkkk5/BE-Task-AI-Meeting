import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { ShiftHandoversRepository } from '../../shift-handovers/repositories/shift-handovers.repository';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { MeetingsRepository } from '../../meetings/repositories/meetings.repository';
import {
  AiReport,
  AiReportDocument,
  TeamReportDataSources,
  TeamReportMetrics,
} from '../schemas/ai-report.schema';
import {
  MeetingSummary,
  MeetingSummaryDocument,
} from '../schemas/meeting-summary.schema';

/**
 * Mac dinh bat 3 nguon chinh, tat so sanh voi bao cao ngay truoc.
 *
 * Bao cao ngay truoc mac dinh tat vi no lam prompt dai them dang ke nhung chi
 * huu ich khi nguoi dung thuc su muon doi chieu tien do.
 */
export const DEFAULT_TEAM_REPORT_DATA_SOURCES: TeamReportDataSources = {
  tasks: false,
  dailyUpdates: false,
  meetingTranscripts: false,
  previousReport: false,
};

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
  senderId: string;
  receiverId: string;
  taskCode: string | null;
  taskTitle: string | null;
  status: string;
  senderName: string | null;
  receiverName: string | null;
  completedWork: string | null;
  remainingWork: string | null;
  blockers: string | null;
  nextSteps: string | null;
  changeRequest: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  acknowledgedAt: string | null;
  rejectedAt: string | null;
};

/**
 * Bien ban hop cua ngay bao cao, da rut gon.
 *
 * Chi lay keyPoints/decisions/actionItems thay vi ca transcript, vi transcript
 * day du se chiem gan het cua so context va phan lon la loi thoai vun.
 */
type TeamMeetingNoteInput = {
  meetingId: string;
  title: string;
  meetingType: string;
  status: string;
  summary: string | null;
  keyPoints: string[];
  decisions: string[];
  actionItems: string[];
};

type PreviousReportInput = {
  reportDate: string;
  summary: string | null;
  todayFocus: string[];
  blockers: string[];
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
  meetingNotes: TeamMeetingNoteInput[];
  previousReport: PreviousReportInput | null;
  dataSources: TeamReportDataSources;
};

type BuildTeamInputParams = {
  workspaceId: string;
  projectId: string;
  reportDate: string;
  sprintId?: string;
  dataSources?: Partial<TeamReportDataSources>;
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
    private readonly meetingsRepository: MeetingsRepository,
    @Optional()
    @InjectModel(MeetingSummary.name)
    private readonly meetingSummaryModel: Model<MeetingSummaryDocument> | null,
    @Optional()
    @InjectModel(AiReport.name)
    private readonly aiReportModel: Model<AiReportDocument> | null,
  ) {}

  async buildTeamReportInput(params: BuildTeamInputParams) {
    const dataSources = this.resolveDataSources(params.dataSources);
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

    // Nguon bi tat thi khong truy van, de prompt that su khong co du lieu do.
    const dailyUpdates = dataSources.dailyUpdates
      ? await this.getTeamDailyUpdates(
          params.projectId,
          reportDate,
          params.sprintId,
        )
      : [];
    const tasks = dataSources.tasks
      ? await this.getTeamTasks(params.projectId, params.sprintId)
      : [];
    const handovers = await this.getTeamHandovers(params.projectId, reportDate);
    const meetingNotes = dataSources.meetingTranscripts
      ? await this.getTeamMeetingNotes(params.projectId, reportDate)
      : [];
    const previousReport = dataSources.previousReport
      ? await this.getPreviousTeamReport(
          params.workspaceId,
          params.projectId,
          reportDate,
        )
      : null;

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
      missingDailyUpdateMembers: dataSources.dailyUpdates
        ? this.getMissingDailyUpdateMembers(members, dailyUpdates)
        : [],
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
      meetingNotes,
      previousReport,
      dataSources,
    } satisfies TeamReportInputData;
  }

  /** Gop lua chon cua nguoi dung voi mac dinh, thieu truong nao thi lay mac dinh. */
  resolveDataSources(
    dataSources?: Partial<TeamReportDataSources>,
  ): TeamReportDataSources {
    return {
      ...DEFAULT_TEAM_REPORT_DATA_SOURCES,
      ...(dataSources ?? {}),
    };
  }

  /**
   * So lieu dinh luong cho the thong ke dau bao cao.
   *
   * Tinh o backend va luu vao document vi API danh sach khong tra ve inputData,
   * frontend se khong the tu tinh lai khi ve danh sach bao cao.
   */
  computeMetrics(inputData: TeamReportInputData): TeamReportMetrics {
    const total = inputData.handoverStats.total;
    const acknowledged = inputData.handoverStats.acknowledged;
    const waiting =
      inputData.handoverStats.pending +
      inputData.handoverStats.changesRequested;
    const involvedMemberIds = new Set(
      inputData.handovers.flatMap((item) => [item.senderId, item.receiverId]),
    );

    return {
      doneTasks: acknowledged,
      totalTasks: total,
      inProgressTasks: waiting,
      blockerCount:
        inputData.handoverStats.changesRequested +
        inputData.handoverStats.rejected,
      progressPercent: total
        ? Math.round((acknowledged / total) * 100)
        : 0,
      memberCount: involvedMemberIds.size,
    };
  }

  /**
   * Bien ban cac cuoc hop trong ngay, uu tien ban tom tat AI da sinh.
   *
   * Neu cuoc hop chua co tom tat thi van liet ke ten hop de bao cao khong bo
   * sot su kien, nhung khong bom transcript tho vao prompt.
   */
  async getTeamMeetingNotes(projectId: string, reportDate: string) {
    const meetings = await this.meetingsRepository.findByProject(projectId, {
      fromDate: reportDate,
      toDate: reportDate,
      page: 1,
      limit: 20,
    });

    if (!meetings.items.length) return [];

    const summaries = this.meetingSummaryModel
      ? await this.meetingSummaryModel
          .find({
            projectId,
            meetingId: { $in: meetings.items.map((meeting) => meeting.id) },
          })
          .sort({ createdAt: -1 })
          .exec()
      : [];
    const summaryByMeeting = new Map(
      summaries.map((summary) => [summary.meetingId, summary]),
    );

    return meetings.items.map((meeting) => {
      const summary = summaryByMeeting.get(meeting.id);

      return {
        meetingId: meeting.id,
        title: meeting.title,
        meetingType: meeting.meetingType,
        status: meeting.status,
        summary: summary?.summary ?? null,
        keyPoints: summary?.keyPoints ?? [],
        decisions: summary?.decisions ?? [],
        actionItems: (summary?.actionItems ?? []).map((item) => item.text),
      } satisfies TeamMeetingNoteInput;
    });
  }

  /** Bao cao giao ban gan nhat truoc ngay dang tao, de AI doi chieu tien do. */
  async getPreviousTeamReport(
    workspaceId: string,
    projectId: string,
    reportDate: string,
  ): Promise<PreviousReportInput | null> {
    if (!this.aiReportModel) return null;

    const previousReport = await this.aiReportModel
      .findOne({
        workspaceId,
        projectId,
        reportType: AiReportType.TeamDailyReport,
        reportDate: { $lt: reportDate },
      })
      .sort({ reportDate: -1, createdAt: -1 })
      .exec();

    if (!previousReport) return null;

    const output = previousReport.aiOutput as {
      summary?: string;
      todayFocus?: string[];
      blockers?: string[];
    };

    return {
      reportDate: previousReport.reportDate,
      summary: output?.summary ?? null,
      todayFocus: output?.todayFocus ?? [],
      blockers: output?.blockers ?? [],
    };
  }

  /** Ban giao trong ngay cua project, rut gon cho prompt AI. */
  async getTeamHandovers(projectId: string, reportDate: string) {
    const handovers = await this.shiftHandoversRepository.findByProjectAndDate(
      projectId,
      reportDate,
    );

    return handovers.map((handover) => ({
      id: handover.id,
      senderId: handover.senderId,
      receiverId: handover.receiverId,
      taskCode: handover.task?.taskCode ?? null,
      taskTitle: handover.task?.title ?? null,
      status: handover.status,
      senderName: handover.sender?.fullName ?? null,
      receiverName: handover.receiver?.fullName ?? null,
      completedWork: handover.completedWork ?? null,
      remainingWork: handover.remainingWork ?? null,
      blockers: handover.blockers ?? null,
      nextSteps: handover.nextSteps ?? null,
      changeRequest: handover.changeRequest ?? null,
      rejectionReason: handover.rejectionReason ?? null,
      submittedAt: handover.submittedAt?.toISOString() ?? null,
      acknowledgedAt: handover.acknowledgedAt?.toISOString() ?? null,
      rejectedAt: handover.rejectedAt?.toISOString() ?? null,
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
      workflowStatusId: task.workflowStatusId,
      workflowStatusKey: task.workflowStatusKey ?? task.status,
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
