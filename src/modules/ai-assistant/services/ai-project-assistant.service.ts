import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyMood } from '../../../common/enums/daily-mood.enum';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdate } from '../../daily-updates/entities/daily-update.entity';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { Project } from '../../projects/entities/project.entity';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { SprintsRepository } from '../../sprints/repositories/sprints.repository';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { Task } from '../../tasks/entities/task.entity';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AskProjectAssistantDto } from '../dto/ask-project-assistant.dto';
import { AiProviderService } from './ai-provider.service';
import {
  MeetingSummary,
  MeetingSummaryDocument,
} from '../schemas/meeting-summary.schema';
import {
  PersonalizedMeetingSummary,
  PersonalizedMeetingSummaryDocument,
} from '../schemas/personalized-meeting-summary.schema';
import {
  ProjectAssistantMessage,
  ProjectAssistantMessageDocument,
} from '../schemas/project-assistant-message.schema';

export type SprintRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskSeverity = 'INFO' | 'WARNING' | 'DANGER';

export type SprintRiskAssessment = {
  sprint: Pick<
    Sprint,
    'id' | 'name' | 'goal' | 'status' | 'startDate' | 'endDate'
  >;
  score: number;
  level: SprintRiskLevel;
  levelLabel: string;
  summary: string;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    remainingTasks: number;
    completionRate: number;
    overdueTasks: number;
    unassignedTasks: number;
    staleTasks: number;
    blockedMembers: number;
    remainingDays: number;
    elapsedPercent: number;
    expectedProgress: number;
    workloadHoursRemaining: number;
    storyPointsRemaining: number;
  };
  signals: {
    code: string;
    severity: RiskSeverity;
    title: string;
    detail: string;
    taskIds: string[];
  }[];
  recommendations: string[];
  generatedAt: string;
};

type AssistantSource = {
  type: 'PROJECT' | 'SPRINT' | 'TASK' | 'DAILY_UPDATE';
  id: string;
  label: string;
  detail: string;
};

export type ProjectAssistantActionDraft = {
  type:
    | 'CREATE_TASK'
    | 'UPDATE_TASK'
    | 'CHANGE_STATUS'
    | 'ASSIGN_TASK'
    | 'MOVE_TASK';
  requiresConfirmation: true;
  taskId?: string;
  taskLabel?: string;
  payload: {
    title?: string;
    description?: string;
    sprintId?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status?: TaskStatus;
    assigneeId?: string | null;
  };
};

@Injectable()
export class AiProjectAssistantService {
  constructor(
    private readonly aiProviderService: AiProviderService,
    private readonly dailyUpdatesRepository: DailyUpdatesRepository,
    private readonly projectAccessService: ProjectAccessService,
    private readonly projectsRepository: ProjectsRepository,
    private readonly sprintAccessService: SprintAccessService,
    private readonly sprintsRepository: SprintsRepository,
    private readonly tasksRepository: TasksRepository,
    private readonly workspaceAccessService: WorkspaceAccessService,
    @Optional()
    @InjectModel(MeetingSummary.name)
    private readonly meetingSummaryModel?: Model<MeetingSummaryDocument>,
    @Optional()
    @InjectModel(PersonalizedMeetingSummary.name)
    private readonly personalizedSummaryModel?: Model<PersonalizedMeetingSummaryDocument>,
    @Optional()
    @InjectModel(ProjectAssistantMessage.name)
    private readonly messageModel?: Model<ProjectAssistantMessageDocument>,
  ) {}

  async ask(
    userId: string,
    workspaceId: string,
    projectId: string,
    dto: AskProjectAssistantDto,
  ) {
    await this.assertAccess(userId, workspaceId, projectId);
    const project = await this.projectsRepository.findByIdAndWorkspace(
      projectId,
      workspaceId,
    );
    const sprint = dto.sprintId
      ? await this.sprintAccessService.assertSprintInProject(
          dto.sprintId,
          projectId,
        )
      : await this.findDefaultSprint(projectId);
    const tasks = sprint
      ? await this.tasksRepository.findBySprint(projectId, sprint.id)
      : (
          await this.tasksRepository.findByProject(projectId, {
            page: 1,
            limit: 100,
          })
        ).items;
    const updates = (
      await this.dailyUpdatesRepository.findTeam(projectId, {
        ...(sprint ? { sprintId: sprint.id } : {}),
        page: 1,
        limit: 100,
      })
    ).items;
    const risk = sprint
      ? this.buildRiskAssessment(sprint, tasks, updates)
      : undefined;
    const [latestMeetingSummary, personalMeetingSummaries] = await Promise.all([
      this.meetingSummaryModel
        ?.findOne({ workspaceId, projectId })
        .sort({ createdAt: -1 })
        .lean()
        .exec() ?? null,
      this.personalizedSummaryModel
        ?.find({ workspaceId, projectId, userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec() ?? [],
    ]);
    const fallback = this.buildFallbackAnswer(
      dto.question,
      userId,
      project,
      sprint,
      tasks,
      updates,
      risk,
      latestMeetingSummary,
      personalMeetingSummaries,
    );
    const sources = this.buildSources(
      userId,
      project,
      sprint,
      tasks,
      updates,
      dto.question,
    );
    const actionDraft = this.buildActionDraft(dto.question, sprint, tasks);

    let output = fallback;
    if (!this.isDeterministicQuestion(dto.question)) {
      try {
        output = (
          await this.aiProviderService.generateProjectAssistantAnswer(
            this.buildPrompt(
              dto.question,
              project,
              sprint,
              tasks,
              updates,
              risk,
              latestMeetingSummary,
              personalMeetingSummaries,
            ),
            fallback,
          )
        ).output;
      } catch {
        output = fallback;
      }
    }

    await this.messageModel?.create([
      {
        workspaceId,
        projectId,
        userId,
        sprintId: sprint?.id ?? null,
        role: 'USER',
        content: dto.question,
        sources: [],
      },
      {
        workspaceId,
        projectId,
        userId,
        sprintId: sprint?.id ?? null,
        role: 'ASSISTANT',
        content: output.answer,
        sources,
        actionDraft: actionDraft ?? null,
      },
    ]);

    return {
      success: true,
      message: 'Hỏi trợ lý dự án thành công',
      data: {
        answer: output.answer,
        sources,
        suggestedQuestions: output.suggestedQuestions,
        sprintRisk: risk
          ? {
              score: risk.score,
              level: risk.level,
              levelLabel: risk.levelLabel,
            }
          : undefined,
        scope: {
          sprintId: sprint?.id ?? null,
          sprintName: sprint?.name ?? null,
        },
        actionDraft,
      },
    };
  }

  async getHistory(userId: string, workspaceId: string, projectId: string) {
    await this.assertAccess(userId, workspaceId, projectId);
    if (!this.messageModel)
      return {
        success: true,
        message: 'Get assistant history successfully',
        data: { items: [] },
      };
    const items = await this.messageModel
      .find({ workspaceId, projectId, userId })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean()
      .exec();
    return {
      success: true,
      message: 'Get assistant history successfully',
      data: {
        items: items.map((item: any) => ({
          id: item._id.toString(),
          role: item.role,
          content: item.content,
          sources: item.sources ?? [],
          actionDraft: item.actionDraft ?? undefined,
          createdAt: item.createdAt,
        })),
      },
    };
  }

  async clearHistory(userId: string, workspaceId: string, projectId: string) {
    await this.assertAccess(userId, workspaceId, projectId);
    await this.messageModel
      ?.deleteMany({ workspaceId, projectId, userId })
      .exec();
    return {
      success: true,
      message: 'Clear assistant history successfully',
      data: null,
    };
  }

  async getSprintRisk(
    userId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
  ) {
    await this.assertAccess(userId, workspaceId, projectId);
    const sprint = await this.sprintAccessService.assertSprintInProject(
      sprintId,
      projectId,
    );
    const [tasks, updates] = await Promise.all([
      this.tasksRepository.findBySprint(projectId, sprintId),
      this.dailyUpdatesRepository.findTeam(projectId, {
        sprintId,
        page: 1,
        limit: 100,
      }),
    ]);

    return {
      success: true,
      message: 'Lấy dự báo rủi ro Sprint thành công',
      data: this.buildRiskAssessment(sprint, tasks, updates.items),
    };
  }

  buildRiskAssessment(
    sprint: Sprint,
    sprintTasks: Task[],
    updates: DailyUpdate[],
    now = new Date(),
  ): SprintRiskAssessment {
    const tasks = sprintTasks.filter(
      (task) => task.status !== TaskStatus.Cancelled,
    );
    const remaining = tasks.filter((task) => task.status !== TaskStatus.Done);
    const completedTasks = tasks.length - remaining.length;
    const completionRate = tasks.length
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;
    const today = this.startOfUtcDay(now);
    const overdue = remaining.filter(
      (task) => task.dueDate && this.toUtcDate(task.dueDate) < today,
    );
    const unassigned = remaining.filter((task) => !task.assigneeId);
    const staleLimit = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const stale = remaining.filter((task) => task.updatedAt < staleLimit);
    const blockedUpdates = updates.filter(
      (update) =>
        update.mood === DailyMood.Blocked || Boolean(update.blockers?.trim()),
    );
    const blockedMembers = new Set(
      blockedUpdates.map((update) => update.userId),
    ).size;
    const { elapsedPercent, remainingDays } = this.calculateSchedule(
      sprint,
      today,
    );
    const progressGap = Math.max(0, elapsedPercent - completionRate);
    const signals: SprintRiskAssessment['signals'] = [];
    let score = 0;

    if (progressGap > 50) score += 30;
    else if (progressGap > 25) score += 20;
    else if (progressGap > 10) score += 10;
    if (progressGap > 10) {
      signals.push({
        code: 'PROGRESS_LAG',
        severity: progressGap > 25 ? 'DANGER' : 'WARNING',
        title: 'Tiến độ thấp hơn kế hoạch',
        detail: `Sprint đã đi qua ${elapsedPercent}% thời gian nhưng mới hoàn thành ${completionRate}% công việc.`,
        taskIds: remaining.map((task) => task.id),
      });
    }

    if (overdue.length) {
      score += Math.min(
        25,
        10 + Math.round((overdue.length / Math.max(1, remaining.length)) * 15),
      );
      signals.push({
        code: 'OVERDUE_TASKS',
        severity: overdue.length >= 3 ? 'DANGER' : 'WARNING',
        title: `${overdue.length} công việc đã quá hạn`,
        detail: overdue
          .map((task) => `${task.taskCode} - ${task.title}`)
          .join('; '),
        taskIds: overdue.map((task) => task.id),
      });
    }

    if (blockedMembers) {
      score += Math.min(20, blockedMembers * 10);
      signals.push({
        code: 'BLOCKERS',
        severity: blockedMembers > 1 ? 'DANGER' : 'WARNING',
        title: `${blockedMembers} thành viên đang có trở ngại`,
        detail: blockedUpdates
          .map(
            (update) =>
              `${update.user?.fullName ?? update.userId}: ${update.blockers ?? 'Đang bị chặn'}`,
          )
          .join('; '),
        taskIds: [],
      });
    }

    if (unassigned.length) {
      score += Math.min(
        15,
        Math.round((unassigned.length / Math.max(1, remaining.length)) * 15),
      );
      signals.push({
        code: 'UNASSIGNED_TASKS',
        severity: unassigned.length === remaining.length ? 'DANGER' : 'WARNING',
        title: `${unassigned.length} công việc chưa có người phụ trách`,
        detail:
          'Cần phân công rõ người chịu trách nhiệm trước khi Sprint tiến sâu hơn.',
        taskIds: unassigned.map((task) => task.id),
      });
    }

    if (stale.length) {
      score += Math.min(10, stale.length * 3);
      signals.push({
        code: 'STALE_TASKS',
        severity: 'WARNING',
        title: `${stale.length} công việc chưa cập nhật hơn 3 ngày`,
        detail: stale
          .map((task) => `${task.taskCode} - ${task.title}`)
          .join('; '),
        taskIds: stale.map((task) => task.id),
      });
    }

    if (
      sprint.status === SprintStatus.Active &&
      remainingDays < 0 &&
      remaining.length
    ) {
      score += 25;
      signals.push({
        code: 'SPRINT_OVERDUE',
        severity: 'DANGER',
        title: 'Sprint đã quá ngày kết thúc',
        detail: `Còn ${remaining.length} công việc chưa hoàn thành sau hạn Sprint.`,
        taskIds: remaining.map((task) => task.id),
      });
    }

    score = Math.min(100, score);
    const { level, label } = this.resolveRiskLevel(score);
    const recommendations = this.buildRecommendations(signals);

    return {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      },
      score,
      level,
      levelLabel: label,
      summary:
        signals.length === 0
          ? 'Chưa phát hiện dấu hiệu rủi ro đáng kể từ dữ liệu hiện tại.'
          : `Phát hiện ${signals.length} dấu hiệu cần theo dõi. Ưu tiên xử lý ${signals[0].title.toLowerCase()}.`,
      metrics: {
        totalTasks: tasks.length,
        completedTasks,
        remainingTasks: remaining.length,
        completionRate,
        overdueTasks: overdue.length,
        unassignedTasks: unassigned.length,
        staleTasks: stale.length,
        blockedMembers,
        remainingDays,
        elapsedPercent,
        expectedProgress: elapsedPercent,
        workloadHoursRemaining: remaining.reduce(
          (sum, task) => sum + (task.estimatedHours ?? 0),
          0,
        ),
        storyPointsRemaining: remaining.reduce(
          (sum, task) => sum + (task.storyPoints ?? 0),
          0,
        ),
      },
      signals,
      recommendations,
      generatedAt: now.toISOString(),
    };
  }

  buildActionDraft(
    question: string,
    sprint: Sprint | null,
    tasks: Task[] = [],
  ): ProjectAssistantActionDraft | undefined {
    const normalized = question.trim();
    const referencedTask = tasks.find((task) =>
      new RegExp(
        `(?:^|\\s)${task.taskCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s|[,.:;-])`,
        'iu',
      ).test(normalized),
    );

    const extractedTitle = normalized
      .replace(
        /^.*?(?:tạo|thêm|lập)\s+(?:một\s+)?(?:task|công việc)\s*(?:mới\s*)?(?::|-)?\s*/iu,
        '',
      )
      .replace(/[.!?]+$/u, '')
      .trim();
    const title = extractedTitle || 'Công việc mới từ Project Assistant';
    const priority = /khẩn|urgent/iu.test(normalized)
      ? 'URGENT'
      : /ưu tiên cao|priority high|high priority/iu.test(normalized)
        ? 'HIGH'
        : /ưu tiên thấp|priority low|low priority/iu.test(normalized)
          ? 'LOW'
          : 'MEDIUM';

    if (/(?:tạo|thêm|lập)\s+(?:một\s+)?(?:task|công việc)/iu.test(normalized))
      return {
        type: 'CREATE_TASK',
        requiresConfirmation: true,
        payload: {
          title: title.slice(0, 255),
          description: `Bản nháp được đề xuất từ yêu cầu: ${normalized}`,
          ...(sprint ? { sprintId: sprint.id } : {}),
          priority,
        },
      };

    if (!referencedTask) return undefined;
    const base = {
      requiresConfirmation: true as const,
      taskId: referencedTask.id,
      taskLabel: `${referencedTask.taskCode} - ${referencedTask.title}`,
    };
    if (
      /\b(?:đổi|chuyển|cập nhật)\s+(?:trạng thái|status)/iu.test(normalized)
    ) {
      const status = /hoàn thành|done/iu.test(normalized)
        ? TaskStatus.Done
        : /đang (?:làm|xử lý)|in[_ ]?progress/iu.test(normalized)
          ? TaskStatus.InProgress
          : /review|kiểm thử|duyệt/iu.test(normalized)
            ? TaskStatus.Review
            : /backlog/iu.test(normalized)
              ? TaskStatus.Backlog
              : TaskStatus.Todo;
      return { ...base, type: 'CHANGE_STATUS', payload: { priority, status } };
    }
    if (/\b(?:giao|gán|assign|đổi người phụ trách)/iu.test(normalized)) {
      return {
        ...base,
        type: 'ASSIGN_TASK',
        payload: { priority, assigneeId: null },
      };
    }
    if (/\b(?:chuyển|đưa)\s+.*(?:sprint|backlog)/iu.test(normalized)) {
      return {
        ...base,
        type: 'MOVE_TASK',
        payload: {
          priority,
          sprintId: /backlog/iu.test(normalized) ? undefined : sprint?.id,
        },
      };
    }
    if (
      /\b(?:sửa|cập nhật|đổi)\s+(?:task|công việc|tiêu đề|mô tả)/iu.test(
        normalized,
      )
    ) {
      return {
        ...base,
        type: 'UPDATE_TASK',
        payload: {
          priority,
          title: referencedTask.title,
          description: referencedTask.description ?? '',
        },
      };
    }
    return undefined;
  }

  private async assertAccess(
    userId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      userId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
  }

  private async findDefaultSprint(projectId: string) {
    const active = await this.sprintsRepository.findActiveByProject(projectId);
    if (active) return active;
    const result = await this.sprintsRepository.findByProject(projectId, {
      page: 1,
      limit: 100,
    });
    return (
      result.items.find((sprint) => sprint.status === SprintStatus.Planned) ??
      result.items.find((sprint) => sprint.status !== SprintStatus.Cancelled) ??
      null
    );
  }

  private buildFallbackAnswer(
    question: string,
    userId: string,
    project: Project | null,
    sprint: Sprint | null,
    tasks: Task[],
    updates: DailyUpdate[],
    risk?: SprintRiskAssessment,
    latestMeetingSummary?: any,
    personalMeetingSummaries: any[] = [],
  ) {
    const normalized = question.toLocaleLowerCase('vi');
    const asksMine = /(?:của tôi|tôi đang|việc tôi|task tôi)/iu.test(normalized);
    const scopedTasks = asksMine
      ? tasks.filter((task) => task.assigneeId === userId)
      : tasks;
    const openTasks = scopedTasks.filter(
      (task) => ![TaskStatus.Done, TaskStatus.Cancelled].includes(task.status),
    );
    const overdue = openTasks.filter(
      (task) =>
        task.dueDate &&
        this.toUtcDate(task.dueDate) < this.startOfUtcDay(new Date()),
    );
    const blockers = updates.filter((update) => update.blockers?.trim());
    let answer = `${asksMine ? 'Bạn' : `Dự án ${project?.name ?? ''}`} có ${scopedTasks.length} công việc trong phạm vi đang xem, ${openTasks.length} công việc chưa hoàn thành.`;

    if (
      (normalized.includes('rủi ro') || normalized.includes('risk')) &&
      risk
    ) {
      answer = `${risk.levelLabel}: ${risk.score}/100. ${risk.summary}`;
    } else if (normalized.includes('quá hạn')) {
      answer = overdue.length
        ? `Có ${overdue.length} công việc quá hạn: ${overdue.map((task) => `${task.taskCode} - ${task.title} — phụ trách: ${task.assignee?.fullName ?? task.assignee?.email ?? 'chưa phân công'}`).join('; ')}.`
        : asksMine
          ? 'Bạn không có công việc quá hạn trong Sprint đang xem.'
          : 'Không có công việc quá hạn trong phạm vi đang xem.';
    } else if (/cuộc họp.*(?:quyết định|đã chốt)|quyết định.*cuộc họp/iu.test(normalized)) {
      const decisions = latestMeetingSummary?.decisions ?? [];
      answer = decisions.length
        ? `Cuộc họp gần nhất “${latestMeetingSummary.title}” đã thống nhất: ${decisions.join('; ')}.`
        : latestMeetingSummary
          ? `Cuộc họp gần nhất “${latestMeetingSummary.title}” chưa ghi nhận quyết định nào.`
          : 'Chưa có bản tóm tắt cuộc họp để xác định các quyết định gần nhất.';
    } else if (/action item|việc sau họp|đầu việc.*cuộc họp/iu.test(normalized)) {
      const items = personalMeetingSummaries.flatMap(
        (summary) => summary.aiOutput?.actionItems ?? [],
      );
      answer = items.length
        ? `Có ${items.length} action item liên quan đến bạn: ${items.map((item: any) => `${item.title ?? item.text}${item.deadline ? ` — hạn ${item.deadline}` : ''}`).join('; ')}. Hệ thống hiện chưa có trạng thái hoàn tất riêng cho action item nên chưa thể khẳng định mục nào đã được xử lý.`
        : 'Không tìm thấy action item nào được giao cho bạn trong các bản tóm tắt cuộc họp.';
    } else if (
      normalized.includes('blocker') ||
      normalized.includes('trở ngại')
    ) {
      answer = blockers.length
        ? `Có ${blockers.length} cập nhật chứa trở ngại: ${blockers.map((item) => `${item.user?.fullName ?? item.userId}: ${item.blockers}`).join('; ')}.`
        : 'Chưa có thành viên báo trở ngại trong phạm vi đang xem.';
    } else if (
      normalized.includes('chưa gán') ||
      normalized.includes('chưa giao')
    ) {
      const unassigned = openTasks.filter((task) => !task.assigneeId);
      answer = unassigned.length
        ? `Có ${unassigned.length} công việc chưa có người phụ trách: ${unassigned.map((task) => task.taskCode).join(', ')}.`
        : 'Tất cả công việc đang mở đều đã có người phụ trách.';
    } else if (
      /(?:sprint hiện tại|sprint này).*(?:bao nhiêu|còn bao nhiêu).*(?:ngày|công việc)|(?:còn bao nhiêu ngày)/iu.test(normalized) &&
      risk
    ) {
      answer = `${sprint?.name ?? 'Sprint hiện tại'} đã hoàn thành ${risk.metrics.completedTasks}/${risk.metrics.totalTasks} công việc; còn ${risk.metrics.remainingTasks} công việc và ${risk.metrics.remainingDays} ngày đến hạn kết thúc.`;
    } else if (
      normalized.includes('tiến độ') ||
      normalized.includes('hoàn thành')
    ) {
      const done = scopedTasks.filter(
        (task) => task.status === TaskStatus.Done,
      ).length;
      const rate = scopedTasks.length ? Math.round((done / scopedTasks.length) * 100) : 0;
      answer = `${sprint?.name ?? project?.name ?? 'Phạm vi hiện tại'} đã hoàn thành ${done}/${scopedTasks.length} công việc, tương đương ${rate}%.`;
    }

    return {
      answer,
      suggestedQuestions: [
        'Sprint hiện tại có rủi ro nào?',
        'Công việc nào đang quá hạn?',
        'Ai đang gặp trở ngại?',
        'Công việc nào chưa có người phụ trách?',
      ],
    };
  }

  private isDeterministicQuestion(question: string) {
    return /quá hạn|rủi ro|risk|blocker|trở ngại|chưa gán|chưa giao|tiến độ|hoàn thành|còn bao nhiêu ngày|cuộc họp.*(?:quyết định|đã chốt)|quyết định.*cuộc họp|action item|việc sau họp|đầu việc.*cuộc họp/iu.test(
      question,
    );
  }

  private buildSources(
    userId: string,
    project: Project | null,
    sprint: Sprint | null,
    tasks: Task[],
    updates: DailyUpdate[],
    question: string,
  ): AssistantSource[] {
    const sources: AssistantSource[] = [];
    if (project) {
      sources.push({
        type: 'PROJECT',
        id: project.id,
        label: project.name,
        detail: 'Thông tin dự án',
      });
    }
    if (sprint) {
      sources.push({
        type: 'SPRINT',
        id: sprint.id,
        label: sprint.name,
        detail: `${sprint.startDate} đến ${sprint.endDate}`,
      });
    }
    const wantsBlockers = /blocker|trở ngại/i.test(question);
    const wantsOverdue = /quá hạn/iu.test(question);
    const asksMine = /(?:của tôi|tôi đang|việc tôi|task tôi)/iu.test(question);
    if (wantsBlockers) {
      sources.push(
        ...updates
          .filter((update) => update.blockers?.trim())
          .slice(0, 5)
          .map((update) => ({
            type: 'DAILY_UPDATE' as const,
            id: update.id,
            label: update.user?.fullName ?? update.userId,
            detail: update.blockers ?? '',
          })),
      );
    } else {
      const relevantTasks = tasks.filter((task) => {
        if (asksMine && task.assigneeId !== userId) return false;
        if (!wantsOverdue) return true;
        return (
          ![TaskStatus.Done, TaskStatus.Cancelled].includes(task.status) &&
          Boolean(task.dueDate) &&
          this.toUtcDate(task.dueDate!) < this.startOfUtcDay(new Date())
        );
      });
      sources.push(
        ...relevantTasks.slice(0, 8).map((task) => ({
          type: 'TASK' as const,
          id: task.id,
          label: `${task.taskCode} - ${task.title}`,
          detail: task.status,
        })),
      );
    }
    return sources;
  }

  private buildPrompt(
    question: string,
    project: Project | null,
    sprint: Sprint | null,
    tasks: Task[],
    updates: DailyUpdate[],
    risk?: SprintRiskAssessment,
    latestMeetingSummary?: any,
    personalMeetingSummaries: any[] = [],
  ) {
    return JSON.stringify({
      question,
      project: project
        ? {
            id: project.id,
            name: project.name,
            description: project.description,
          }
        : null,
      sprint: sprint
        ? {
            id: sprint.id,
            name: sprint.name,
            goal: sprint.goal,
            status: sprint.status,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
          }
        : null,
      tasks: tasks.map((task) => ({
        id: task.id,
        code: task.taskCode,
        title: task.title,
        status: task.status,
        assignee: task.assignee?.fullName ?? null,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        storyPoints: task.storyPoints,
      })),
      dailyUpdates: updates.map((update) => ({
        user: update.user?.fullName ?? update.userId,
        date: update.updateDate,
        todayPlan: update.todayPlan,
        blockers: update.blockers,
        mood: update.mood,
      })),
      latestMeetingSummary: latestMeetingSummary
        ? {
            title: latestMeetingSummary.title,
            summary: latestMeetingSummary.summary,
            decisions: latestMeetingSummary.decisions ?? [],
            actionItems: latestMeetingSummary.actionItems ?? [],
            risks: latestMeetingSummary.risks ?? [],
          }
        : null,
      myMeetingActionItems: personalMeetingSummaries.flatMap(
        (summary) => summary.aiOutput?.actionItems ?? [],
      ),
      risk,
    });
  }

  private calculateSchedule(sprint: Sprint, today: Date) {
    const start = this.toUtcDate(sprint.startDate);
    const end = this.toUtcDate(sprint.endDate);
    const duration = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
    );
    const elapsedDays =
      Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
    const elapsedPercent =
      sprint.status === SprintStatus.Completed
        ? 100
        : sprint.status === SprintStatus.Planned
          ? 0
          : Math.max(
              0,
              Math.min(100, Math.round((elapsedDays / duration) * 100)),
            );
    const remainingDays = Math.round(
      (end.getTime() - today.getTime()) / 86400000,
    );
    return { elapsedPercent, remainingDays };
  }

  private resolveRiskLevel(score: number): {
    level: SprintRiskLevel;
    label: string;
  } {
    if (score >= 75) return { level: 'CRITICAL', label: 'Rủi ro nghiêm trọng' };
    if (score >= 50) return { level: 'HIGH', label: 'Rủi ro cao' };
    if (score >= 25) return { level: 'MEDIUM', label: 'Rủi ro trung bình' };
    return { level: 'LOW', label: 'Rủi ro thấp' };
  }

  private buildRecommendations(signals: SprintRiskAssessment['signals']) {
    const recommendations = signals.map((signal) => {
      if (signal.code === 'OVERDUE_TASKS')
        return 'Rà soát task quá hạn và thống nhất lại hạn xử lý trong Daily Scrum gần nhất.';
      if (signal.code === 'BLOCKERS')
        return 'Gỡ blocker theo người phụ trách và ghi rõ thời hạn phản hồi.';
      if (signal.code === 'UNASSIGNED_TASKS')
        return 'Phân công người chịu trách nhiệm cho các task đang mở.';
      if (signal.code === 'STALE_TASKS')
        return 'Yêu cầu cập nhật trạng thái các task đã đứng lâu.';
      return 'Điều chỉnh phạm vi hoặc nguồn lực để đưa tiến độ về kế hoạch.';
    });
    return [...new Set(recommendations)].slice(0, 4);
  }

  private toUtcDate(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private startOfUtcDay(value: Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }
}
