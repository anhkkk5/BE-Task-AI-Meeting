import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import ExcelJS from 'exceljs';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { TaskType } from '../../../common/enums/task-type.enum';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { SprintsRepository } from '../../sprints/repositories/sprints.repository';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { AssignTaskDto } from '../dto/assign-task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import {
  CommitTaskImportDto,
  TaskImportItemDto,
} from '../dto/import-tasks.dto';
import { MoveTaskSprintDto } from '../dto/move-task-sprint.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import {
  CreateTaskCommentDto,
  UpdateTaskCommentDto,
} from '../dto/task-comment.dto';
import { Task } from '../entities/task.entity';
import { TaskActivityAction } from '../entities/task-activity-log.entity';
import { TaskActivityLogsRepository } from '../repositories/task-activity-logs.repository';
import { TaskCommentsRepository } from '../repositories/task-comments.repository';
import { TasksRepository } from '../repositories/tasks.repository';
import { TaskDependenciesRepository } from '../repositories/task-dependencies.repository';
import { TaskAccessService } from './task-access.service';
import { TaskCodeService } from './task-code.service';

type UploadedExcelFile = {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
  size?: number;
};

type ImportField =
  | 'title'
  | 'description'
  | 'sprintId'
  | 'sprintName'
  | 'status'
  | 'assigneeId'
  | 'assigneeEmail'
  | 'dueDate'
  | 'estimatedHours'
  | 'storyPoints';

type ImportRawRow = Record<ImportField, string>;

type ImportPreviewRow = {
  rowNumber: number;
  valid: boolean;
  errors: string[];
  data: TaskImportItemDto;
  raw: ImportRawRow;
};

type ImportContext = {
  membersById: Map<string, WorkspaceMember>;
  membersByEmail: Map<string, WorkspaceMember>;
  sprintsById: Map<string, Sprint>;
  sprintsByName: Map<string, Sprint[]>;
};

const importFields: ImportField[] = [
  'title',
  'description',
  'sprintId',
  'sprintName',
  'status',
  'assigneeId',
  'assigneeEmail',
  'dueDate',
  'estimatedHours',
  'storyPoints',
];

const importHeaderAliases: Record<ImportField, string[]> = {
  title: ['title', 'tieu de', 'ten task', 'task title', 'summary'],
  description: ['description', 'mo ta', 'noi dung'],
  sprintId: ['sprint id', 'sprintid'],
  sprintName: ['sprint name', 'sprint', 'ten sprint'],
  status: ['status', 'trang thai'],
  assigneeId: ['assignee id', 'assigneeid', 'nguoi nhan id'],
  assigneeEmail: [
    'assignee email',
    'assignee',
    'email nguoi nhan',
    'nguoi nhan',
  ],
  dueDate: ['due date', 'duedate', 'han hoan thanh', 'deadline'],
  estimatedHours: ['estimated hours', 'estimatedhours', 'gio du kien'],
  storyPoints: ['story points', 'storypoints', 'point'],
};

const taskStatusLookup = new Map<string, TaskStatus>([
  ['backlog', TaskStatus.Backlog],
  ['todo', TaskStatus.Todo],
  ['canlam', TaskStatus.Todo],
  ['dangcho', TaskStatus.Todo],
  ['inprogress', TaskStatus.InProgress],
  ['danglam', TaskStatus.InProgress],
  ['review', TaskStatus.Review],
  ['dangreview', TaskStatus.Review],
  ['done', TaskStatus.Done],
  ['hoanthanh', TaskStatus.Done],
  ['cancelled', TaskStatus.Cancelled],
  ['canceled', TaskStatus.Cancelled],
  ['dahuy', TaskStatus.Cancelled],
]);

const normalizedImportHeaders = new Map<string, ImportField>(
  importFields.flatMap((field) =>
    importHeaderAliases[field].map((alias) => [
      normalizeLookupText(alias),
      field,
    ]),
  ),
);

function normalizeLookupText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly taskAccessService: TaskAccessService,
    private readonly taskCodeService: TaskCodeService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly sprintsRepository: SprintsRepository,
    @Optional()
    private readonly taskActivityLogsRepository?: TaskActivityLogsRepository,
    @Optional()
    private readonly taskCommentsRepository?: TaskCommentsRepository,
    @Optional()
    private readonly notificationsService?: NotificationsService,
    @Optional()
    private readonly taskDependenciesRepository?: TaskDependenciesRepository,
  ) {}

  async createTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: CreateTaskDto,
  ) {
    const project = await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );

    if (dto.sprintId) {
      await this.taskAccessService.assertSprintCanReceiveTask(
        dto.sprintId,
        projectId,
      );
    }

    if (dto.assigneeId) {
      await this.taskAccessService.assertAssignableUser(
        dto.assigneeId,
        workspaceId,
      );
    }
    if (dto.reporterId) {
      await this.taskAccessService.assertAssignableUser(dto.reporterId, workspaceId);
    }
    const parent = dto.parentId
      ? await this.assertValidParent(dto.parentId, projectId, dto.taskType ?? TaskType.Task)
      : null;
    if ((dto.taskType ?? TaskType.Task) === TaskType.Subtask && !parent) {
      throw new BadRequestException('SUBTASK must have a parent task');
    }

    const taskCode = await this.taskCodeService.generateTaskCode(project);
    const initialStatus = dto.sprintId ? TaskStatus.Todo : TaskStatus.Backlog;
    const workflowStatusId = this.tasksRepository.findWorkflowStatusId ? await this.tasksRepository.findWorkflowStatusId(project.workflowTemplateId, initialStatus) : null;
    const task = await this.tasksRepository.create({
      projectId,
      sprintId: dto.sprintId ?? null,
      taskCode,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      status: initialStatus,
      workflowStatusId,
      assigneeId: dto.assigneeId ?? null,
      createdBy: currentUserId,
      dueDate: dto.dueDate ?? null,
      estimatedHours: dto.estimatedHours ?? null,
      storyPoints: dto.storyPoints ?? null,
      taskType: dto.taskType ?? TaskType.Task,
      priority: dto.priority ?? TaskPriority.Medium,
      parentId: parent?.id ?? null,
      labels: this.normalizeLabels(dto.labels),
      acceptanceCriteria: dto.acceptanceCriteria?.trim() || null,
      reporterId: dto.reporterId ?? currentUserId,
      completedAt: null,
      startedAt: null,
    });
    await this.recordActivity(task, currentUserId, TaskActivityAction.Created);

    return {
      success: true,
      message: 'Create task successfully',
      data: {
        task: this.toTaskResponse(task),
      },
    };
  }

  async createTaskImportTemplate(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    const project = await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const context = await this.buildImportContext(workspaceId, projectId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Agile AI';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Backlog import');
    sheet.columns = [
      { header: 'title', key: 'title', width: 36 },
      { header: 'description', key: 'description', width: 48 },
      { header: 'sprintName', key: 'sprintName', width: 28 },
      { header: 'sprintId', key: 'sprintId', width: 40 },
      { header: 'status', key: 'status', width: 18 },
      { header: 'assigneeEmail', key: 'assigneeEmail', width: 32 },
      { header: 'dueDate', key: 'dueDate', width: 16 },
      { header: 'storyPoints', key: 'storyPoints', width: 14 },
      { header: 'estimatedHours', key: 'estimatedHours', width: 16 },
    ];

    sheet.addRow({
      title: 'Thiết kế backlog giống Jira',
      description: 'Tạo task trong sprint bằng file Excel',
      sprintName: 'Sprint 1',
      sprintId: '',
      status: 'TODO',
      assigneeEmail: 'member@example.com',
      dueDate: '2026-07-20',
      storyPoints: 3,
      estimatedHours: 4,
    });
    sheet.addRow({
      title: 'Task chưa gán sprint',
      description: 'Dòng này sẽ nằm trong Backlog',
      sprintName: '',
      sprintId: '',
      status: 'BACKLOG',
      assigneeEmail: '',
      dueDate: '2026-07-22',
      storyPoints: 2,
      estimatedHours: 2,
    });

    sheet.getRow(1).font = { bold: true, color: { argb: '172B4D' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E9F2FF' },
    };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    const guideSheet = workbook.addWorksheet('Hướng dẫn');
    guideSheet.columns = [
      { header: 'Mục', key: 'name', width: 28 },
      { header: 'Giá trị / Ghi chú', key: 'value', width: 90 },
    ];
    guideSheet.addRows([
      {
        name: 'Project',
        value: `${project.name ?? project.keyCode} (${project.id})`,
      },
      {
        name: 'Cột bắt buộc',
        value: 'title. Các cột còn lại có thể để trống.',
      },
      {
        name: 'Status',
        value:
          'BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE. Không import CANCELLED.',
      },
      {
        name: 'Priority',
        value: 'LOW, MEDIUM, HIGH, URGENT.',
      },
      {
        name: 'Sprint',
        value:
          'Điền sprintId để chắc chắn nhất. Nếu dùng sprintName thì tên sprint phải không bị trùng.',
      },
      {
        name: 'Assignee',
        value: 'Điền assigneeEmail của thành viên ACTIVE trong workspace.',
      },
      {
        name: 'Ngày',
        value: 'Dùng định dạng YYYY-MM-DD, ví dụ 2026-07-20.',
      },
    ]);
    guideSheet.getRow(1).font = { bold: true };

    const sprintSheet = workbook.addWorksheet('Sprints');
    sprintSheet.columns = [
      { header: 'sprintName', key: 'name', width: 32 },
      { header: 'sprintId', key: 'id', width: 40 },
      { header: 'status', key: 'status', width: 18 },
    ];
    [...context.sprintsById.values()].forEach((sprint) => {
      sprintSheet.addRow({
        name: sprint.name,
        id: sprint.id,
        status: sprint.status,
      });
    });
    sprintSheet.getRow(1).font = { bold: true };

    const memberSheet = workbook.addWorksheet('Members');
    memberSheet.columns = [
      { header: 'fullName', key: 'fullName', width: 28 },
      { header: 'email', key: 'email', width: 34 },
      { header: 'userId', key: 'userId', width: 40 },
    ];
    [...context.membersById.values()].forEach((member) => {
      memberSheet.addRow({
        fullName: member.user?.fullName ?? '',
        email: member.user?.email ?? '',
        userId: member.userId,
      });
    });
    memberSheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  async previewTaskImport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    file: UploadedExcelFile | undefined,
  ) {
    const project = await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );

    if (!file?.buffer) {
      throw new BadRequestException('Vui lòng chọn file Excel.');
    }

    if (file.size && file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File Excel không được vượt quá 2MB.');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Uint8Array.from(file.buffer).buffer);
    const worksheet =
      workbook.getWorksheet('Backlog import') ?? workbook.worksheets[0];

    if (!worksheet) {
      throw new BadRequestException('File Excel không có worksheet dữ liệu.');
    }

    const headerMap = this.getImportHeaderMap(worksheet.getRow(1));

    if (!headerMap.has('title')) {
      throw new BadRequestException('File Excel thiếu cột title.');
    }

    const context = await this.buildImportContext(workspaceId, projectId);
    const rows: ImportPreviewRow[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const raw = this.readImportRawRow(row, headerMap);

      if (this.isEmptyImportRawRow(raw)) return;
      rows.push(this.validateImportRawRow(rowNumber, raw, context));
    });

    if (rows.length > 200) {
      throw new BadRequestException('Mỗi lần chỉ import tối đa 200 dòng task.');
    }

    const validRows = rows.filter((row) => row.valid).length;

    return {
      success: true,
      message: 'Preview task import successfully',
      data: {
        items: rows,
        summary: {
          totalRows: rows.length,
          validRows,
          invalidRows: rows.length - validRows,
        },
      },
    };
  }

  async commitTaskImport(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    dto: CommitTaskImportDto,
  ) {
    const project = await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const context = await this.buildImportContext(workspaceId, projectId);

    const checkedRows = dto.items.map((item, index) =>
      this.validateImportRawRow(
        item.rowNumber ?? index + 2,
        this.importItemToRawRow(item),
        context,
      ),
    );
    const invalidMessages = checkedRows.flatMap((row) =>
      row.errors.map((error) => `Dòng ${row.rowNumber}: ${error}`),
    );

    if (invalidMessages.length > 0) {
      throw new BadRequestException(invalidMessages);
    }

    const tasks: Task[] = [];

    for (const row of checkedRows) {
      const item = row.data;
      const taskCode = await this.taskCodeService.generateTaskCode(project);
      const initialStatus = item.status ?? (item.sprintId ? TaskStatus.Todo : TaskStatus.Backlog);
      const workflowStatusId = this.tasksRepository.findWorkflowStatusId
        ? await this.tasksRepository.findWorkflowStatusId(project.workflowTemplateId, initialStatus)
        : null;
      const task = await this.tasksRepository.create({
        projectId,
        sprintId: item.sprintId ?? null,
        taskCode,
        title: item.title.trim(),
        description: item.description?.trim() || null,
        status: initialStatus,
        workflowStatusId,
        assigneeId: item.assigneeId ?? null,
        createdBy: currentUserId,
        dueDate: item.dueDate ?? null,
        estimatedHours: item.estimatedHours ?? null,
        storyPoints: item.storyPoints ?? null,
        taskType: TaskType.Task,
        priority: TaskPriority.Medium,
        parentId: null,
      });
      await this.recordActivity(task, currentUserId, TaskActivityAction.Created, {
        source: { from: null, to: 'IMPORT' },
      });
      tasks.push(task);
    }

    return {
      success: true,
      message: 'Import tasks successfully',
      data: {
        items: tasks.map((task) => this.toTaskResponse(task)),
        summary: {
          created: tasks.length,
        },
      },
    };
  }

  async getTasks(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    query: GetTasksQueryDto,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );

    if (query.sprintId) {
      await this.taskAccessService.assertSprintInProject(
        query.sprintId,
        projectId,
      );
    }

    const result = await this.tasksRepository.findByProject(projectId, query);

    return {
      success: true,
      message: 'Get tasks successfully',
      data: {
        items: result.items.map((task) => this.toTaskResponse(task)),
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      },
    };
  }

  async getBacklogTasks(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const items = await this.tasksRepository.findBacklogByProject(projectId);

    return {
      success: true,
      message: 'Get backlog tasks successfully',
      data: {
        items: items.map((task) => this.toTaskResponse(task)),
      },
    };
  }

  async getSprintTasks(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    sprintId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.taskAccessService.assertSprintInProject(sprintId, projectId);
    const items = await this.tasksRepository.findBySprint(projectId, sprintId);

    return {
      success: true,
      message: 'Get sprint tasks successfully',
      data: {
        items: items.map((task) => this.toTaskResponse(task)),
      },
    };
  }

  async getTaskDetail(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );

    return {
      success: true,
      message: 'Get task detail successfully',
      data: {
        task: this.toTaskResponse(task),
      },
    };
  }

  async getTaskActivities(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    await this.taskAccessService.assertTaskInProject(taskId, projectId);
    const items = this.taskActivityLogsRepository
      ? await this.taskActivityLogsRepository.findByTask(taskId)
      : [];

    return {
      success: true,
      message: 'Get task activities successfully',
      data: {
        items: items.map((item) => ({
          id: item.id,
          action: item.action,
          changes: item.changes,
          actor: {
            id: item.actor.id,
            fullName: item.actor.fullName,
            email: item.actor.email,
            avatarUrl: item.actor.avatarUrl,
          },
          createdAt: item.createdAt,
        })),
      },
    };
  }

  async getTaskComments(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.assertTaskReadable(currentUserId, workspaceId, projectId, taskId);
    const items = this.taskCommentsRepository
      ? await this.taskCommentsRepository.findByTask(taskId)
      : [];
    return {
      success: true,
      message: 'Get task comments successfully',
      data: { items: items.map((item) => this.toCommentResponse(item)) },
    };
  }

  async createTaskComment(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: CreateTaskCommentDto,
  ) {
    const task = await this.assertTaskReadable(
      currentUserId,
      workspaceId,
      projectId,
      taskId,
    );
    if (!this.taskCommentsRepository) {
      throw new BadRequestException('Task comments are unavailable');
    }
    const content = dto.content.trim();
    const mentionedUserIds = await this.resolveMentionedUserIds(
      content,
      workspaceId,
    );
    const comment = await this.taskCommentsRepository.create({
      taskId,
      authorId: currentUserId,
      content,
      mentionedUserIds,
    });
    await Promise.all(
      mentionedUserIds
        .filter((userId) => userId !== currentUserId)
        .map((recipientId) =>
          this.notificationsService?.create({
            recipientId,
            type: NotificationType.TaskMentioned,
            title: 'Bạn được nhắc trong bình luận',
            body: `${task.taskCode} - ${task.title}`,
            link: `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`,
            metadata: { taskId: task.id, commentId: comment.id, actorId: currentUserId },
          }),
        ),
    );
    await this.recordActivity(task, currentUserId, TaskActivityAction.Commented, {
      commentId: { from: null, to: comment.id },
      mentionedUserIds: { from: [], to: mentionedUserIds },
    });
    const saved = await this.taskCommentsRepository.findById(comment.id, taskId);
    return {
      success: true,
      message: 'Create task comment successfully',
      data: { comment: this.toCommentResponse(saved ?? comment) },
    };
  }

  async updateTaskComment(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    commentId: string,
    dto: UpdateTaskCommentDto,
  ) {
    const task = await this.assertTaskReadable(
      currentUserId,
      workspaceId,
      projectId,
      taskId,
    );
    const comment = await this.requireOwnComment(currentUserId, taskId, commentId);
    const previousContent = comment.content;
    const content = dto.content.trim();
    const mentionedUserIds = await this.resolveMentionedUserIds(content, workspaceId);
    const updated = await this.taskCommentsRepository!.update(comment, {
      content,
      mentionedUserIds,
    });
    await this.recordActivity(task, currentUserId, TaskActivityAction.CommentUpdated, {
      commentId: { from: commentId, to: commentId },
      content: { from: previousContent, to: content },
    });
    return {
      success: true,
      message: 'Update task comment successfully',
      data: { comment: this.toCommentResponse(updated) },
    };
  }

  async deleteTaskComment(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    commentId: string,
  ) {
    const task = await this.assertTaskReadable(
      currentUserId,
      workspaceId,
      projectId,
      taskId,
    );
    const comment = await this.requireOwnComment(currentUserId, taskId, commentId);
    await this.recordActivity(task, currentUserId, TaskActivityAction.CommentDeleted, {
      commentId: { from: comment.id, to: null },
    });
    await this.taskCommentsRepository!.softDelete(comment);
    return { success: true, message: 'Delete task comment successfully', data: null };
  }

  async updateTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);
    const previous = this.pickTaskFields(task, [
      'title',
      'description',
      'dueDate',
      'estimatedHours',
      'storyPoints',
      'taskType',
      'priority',
      'parentId',
      'labels',
      'acceptanceCriteria',
      'reporterId',
    ]);

    const nextTaskType = dto.taskType ?? task.taskType;
    const nextParentId = dto.parentId === undefined ? task.parentId : dto.parentId;
    const parent = nextParentId
      ? await this.assertValidParent(nextParentId, projectId, nextTaskType, task.id)
      : null;
    if (nextTaskType === TaskType.Subtask && !parent) {
      throw new BadRequestException('SUBTASK must have a parent task');
    }
    if (dto.reporterId) {
      await this.taskAccessService.assertAssignableUser(dto.reporterId, workspaceId);
    }

    const updatedTask = await this.tasksRepository.update(task, {
      title: dto.title?.trim() ?? task.title,
      description:
        dto.description === undefined
          ? task.description
          : dto.description.trim() || null,
      dueDate: dto.dueDate ?? task.dueDate,
      estimatedHours: dto.estimatedHours ?? task.estimatedHours,
      storyPoints: dto.storyPoints ?? task.storyPoints,
      taskType: nextTaskType,
      priority: dto.priority ?? task.priority,
      parentId: parent?.id ?? null,
      labels: dto.labels === undefined ? task.labels : this.normalizeLabels(dto.labels),
      acceptanceCriteria: dto.acceptanceCriteria === undefined ? task.acceptanceCriteria : dto.acceptanceCriteria.trim() || null,
      reporterId: dto.reporterId === undefined ? task.reporterId : dto.reporterId,
    });
    await this.recordActivity(
      updatedTask,
      currentUserId,
      TaskActivityAction.Updated,
      this.buildChanges(previous, updatedTask),
    );

    return {
      success: true,
      message: 'Update task successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async updateTaskStatus(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: UpdateTaskStatusDto,
  ) {
    const project = await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);
    const selectedWorkflowStatus = dto.workflowStatusId && this.tasksRepository.findWorkflowStatus
      ? await this.tasksRepository.findWorkflowStatus(project.workflowTemplateId, dto.workflowStatusId)
      : null;
    if (dto.workflowStatusId && !selectedWorkflowStatus) {
      throw new BadRequestException('Workflow status does not belong to the project template');
    }
    if (selectedWorkflowStatus && !selectedWorkflowStatus.enabled) {
      throw new BadRequestException('Workflow status is disabled');
    }
    const targetStatus = selectedWorkflowStatus?.key ?? dto.status;
    if (!targetStatus) throw new BadRequestException('A target workflow status is required');
    const role = await this.taskAccessService.assertUserCanUpdateTaskStatus(
      currentUserId,
      workspaceId,
      task,
      targetStatus,
    );
    if (task.status !== targetStatus && project.workflowTransitions) {
      const transition = project.workflowTransitions.find((item) => item.from === task.status && item.to === targetStatus);
      if (!transition) throw new BadRequestException(`Transition ${task.status} -> ${targetStatus} is not allowed by project workflow`);
      if (transition.roles?.length && !transition.roles.includes(role)) throw new ForbiddenException('Your role is not allowed to perform this workflow transition');
    }
    this.assertBacklogStatusMatchesTaskLocation(task, targetStatus);

    const incompleteBlockers =
      targetStatus === TaskStatus.Done && this.taskDependenciesRepository
        ? await this.taskDependenciesRepository.findIncompleteBlockers(task.id)
        : [];
    if (targetStatus === TaskStatus.Done) {
      const incompleteChildren = await this.tasksRepository.findIncompleteChildren(task.id);
      if (incompleteChildren.length) {
        throw new BadRequestException({
          message: 'Complete all child tasks before closing the parent task',
          children: incompleteChildren.map((child) => ({ id: child.id, taskCode: child.taskCode, title: child.title, status: child.status })),
        });
      }
    }
    if (incompleteBlockers.length) {
      const managerRoles = [WorkspaceRole.Owner, WorkspaceRole.ScrumMaster, WorkspaceRole.ProjectManager];
      const canOverride = managerRoles.includes(role) && dto.overrideBlocked === true && Boolean(dto.overrideReason?.trim());
      if (!canOverride) {
        throw new BadRequestException({
          message: 'Task is blocked by incomplete dependencies',
          blockers: incompleteBlockers.map((item) => {
            const blocker = item.sourceTaskId === task.id ? item.targetTask : item.sourceTask;
            return { id: blocker.id, taskCode: blocker.taskCode, title: blocker.title, status: blocker.status };
          }),
          overrideRequired: managerRoles.includes(role),
        });
      }
    }

    const previousStatus = task.status;

    const workflowStatusId = selectedWorkflowStatus?.id ?? (this.tasksRepository.findWorkflowStatusId ? await this.tasksRepository.findWorkflowStatusId(project.workflowTemplateId, targetStatus) : null);
    const updatedTask = await this.tasksRepository.update(task, {
      status: targetStatus,
      workflowStatusId,
      completedAt: targetStatus === TaskStatus.Done ? task.completedAt ?? new Date() : null,
      startedAt: targetStatus === TaskStatus.InProgress ? task.startedAt ?? new Date() : task.startedAt,
    });
    await this.recordActivity(
      updatedTask,
      currentUserId,
      TaskActivityAction.StatusChanged,
      {
        status: { from: previousStatus, to: updatedTask.status },
        ...(incompleteBlockers.length ? { dependencyOverrideReason: { from: null, to: dto.overrideReason!.trim() } } : {}),
      },
    );

    if (targetStatus === TaskStatus.Done && previousStatus !== TaskStatus.Done) {
      await this.notifyNewlyUnblockedTasks(updatedTask, workspaceId, projectId);
    }

    return {
      success: true,
      message: 'Update task status successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async assignTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: AssignTaskDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);

    if (dto.assigneeId) {
      await this.taskAccessService.assertAssignableUser(
        dto.assigneeId,
        workspaceId,
      );
    }

    const previousAssigneeId = task.assigneeId;

    const updatedTask = await this.tasksRepository.update(task, {
      assigneeId: dto.assigneeId,
    });
    if (
      dto.assigneeId &&
      dto.assigneeId !== currentUserId &&
      dto.assigneeId !== previousAssigneeId
    ) {
      await this.notificationsService?.create({
        recipientId: dto.assigneeId,
        type: NotificationType.TaskAssigned,
        title: 'Bạn được giao một công việc mới',
        body: `${updatedTask.taskCode} - ${updatedTask.title}`,
        link: `/workspaces/${workspaceId}/projects/${projectId}/tasks/${updatedTask.id}`,
        metadata: { taskId: updatedTask.id, actorId: currentUserId },
      });
    }
    await this.recordActivity(
      updatedTask,
      currentUserId,
      TaskActivityAction.Assigned,
      { assigneeId: { from: previousAssigneeId, to: updatedTask.assigneeId } },
    );

    return {
      success: true,
      message: 'Assign task successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async moveTaskToSprint(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
    dto: MoveTaskSprintDto,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);

    if (dto.sprintId) {
      await this.taskAccessService.assertSprintCanReceiveTask(
        dto.sprintId,
        projectId,
      );
    }

    const previousSprintId = task.sprintId;
    const previousStatus = task.status;

    const updatedTask = await this.tasksRepository.update(task, {
      sprintId: dto.sprintId,
      status: dto.sprintId
        ? task.status === TaskStatus.Backlog
          ? TaskStatus.Todo
          : task.status
        : TaskStatus.Backlog,
    });
    await this.recordActivity(
      updatedTask,
      currentUserId,
      TaskActivityAction.SprintMoved,
      this.compactChanges({
        sprintId: { from: previousSprintId, to: updatedTask.sprintId },
        status: { from: previousStatus, to: updatedTask.status },
      }),
    );

    return {
      success: true,
      message: 'Move task sprint successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async cancelTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.assertWritableProject(workspaceId, projectId);
    await this.workspaceAccessService.assertWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    this.taskAccessService.assertTaskEditable(task);

    const previousStatus = task.status;

    const updatedTask = await this.tasksRepository.update(task, {
      status: TaskStatus.Cancelled,
    });
    await this.recordActivity(
      updatedTask,
      currentUserId,
      TaskActivityAction.Cancelled,
      { status: { from: previousStatus, to: updatedTask.status } },
    );

    return {
      success: true,
      message: 'Cancel task successfully',
      data: {
        task: this.toTaskResponse(updatedTask),
      },
    };
  }

  async deleteTask(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const task = await this.taskAccessService.assertTaskInProject(
      taskId,
      projectId,
    );
    await this.taskAccessService.assertUserCanDeleteTask(
      currentUserId,
      workspaceId,
      task,
    );
    const children = await this.tasksRepository.findChildren(task.id);
    if (children.length) {
      throw new BadRequestException({
        message: 'Move or delete child tasks before deleting the parent task',
        children: children.map((child) => ({ id: child.id, taskCode: child.taskCode, title: child.title })),
      });
    }
    await this.recordActivity(task, currentUserId, TaskActivityAction.Deleted);
    await this.tasksRepository.softDelete(task);

    return {
      success: true,
      message: 'Delete task successfully',
      data: null,
    };
  }

  private async buildImportContext(
    workspaceId: string,
    projectId: string,
  ): Promise<ImportContext> {
    const [members, sprintsResult] = await Promise.all([
      this.workspaceMembersRepository.findActiveByWorkspace(workspaceId),
      this.sprintsRepository.findByProject(projectId, { page: 1, limit: 500 }),
    ]);
    const membersById = new Map<string, WorkspaceMember>();
    const membersByEmail = new Map<string, WorkspaceMember>();
    const sprintsById = new Map<string, Sprint>();
    const sprintsByName = new Map<string, Sprint[]>();

    members.forEach((member) => {
      membersById.set(member.userId, member);

      if (member.user?.email) {
        membersByEmail.set(member.user.email.trim().toLowerCase(), member);
      }
    });

    sprintsResult.items.forEach((sprint) => {
      sprintsById.set(sprint.id, sprint);
      const sprintNameKey = normalizeLookupText(sprint.name);
      const existing = sprintsByName.get(sprintNameKey) ?? [];
      existing.push(sprint);
      sprintsByName.set(sprintNameKey, existing);
    });

    return {
      membersById,
      membersByEmail,
      sprintsById,
      sprintsByName,
    };
  }

  private getImportHeaderMap(row: ExcelJS.Row) {
    const headerMap = new Map<ImportField, number>();

    row.eachCell((cell, columnNumber) => {
      const field = normalizedImportHeaders.get(
        normalizeLookupText(this.cellToText(cell)),
      );

      if (field && !headerMap.has(field)) {
        headerMap.set(field, columnNumber);
      }
    });

    return headerMap;
  }

  private readImportRawRow(
    row: ExcelJS.Row,
    headerMap: Map<ImportField, number>,
  ): ImportRawRow {
    const raw = {} as ImportRawRow;

    importFields.forEach((field) => {
      const columnNumber = headerMap.get(field);
      raw[field] = columnNumber
        ? this.cellToText(row.getCell(columnNumber))
        : '';
    });

    return raw;
  }

  private importItemToRawRow(item: TaskImportItemDto): ImportRawRow {
    return {
      title: item.title ?? '',
      description: item.description ?? '',
      sprintId: item.sprintId ?? '',
      sprintName: item.sprintName ?? '',
      status: item.status ?? '',
      assigneeId: item.assigneeId ?? '',
      assigneeEmail: item.assigneeEmail ?? '',
      dueDate: item.dueDate ?? '',
      estimatedHours:
        item.estimatedHours === null || item.estimatedHours === undefined
          ? ''
          : String(item.estimatedHours),
      storyPoints:
        item.storyPoints === null || item.storyPoints === undefined
          ? ''
          : String(item.storyPoints),
    };
  }

  private validateImportRawRow(
    rowNumber: number,
    raw: ImportRawRow,
    context: ImportContext,
  ): ImportPreviewRow {
    const errors: string[] = [];
    const title = raw.title.trim();
    const sprintId = this.resolveImportSprintId(raw, context, errors);
    const assigneeId = this.resolveImportAssigneeId(raw, context, errors);
    const status = this.resolveImportStatus(raw.status, sprintId, errors);
    const dueDate = this.resolveImportDate(raw.dueDate, errors);
    const estimatedHours = this.resolveImportNumber(
      raw.estimatedHours,
      'estimatedHours',
      errors,
    );
    const storyPoints = this.resolveImportInteger(
      raw.storyPoints,
      'storyPoints',
      errors,
    );

    if (title.length < 2) {
      errors.push('title phải có ít nhất 2 ký tự.');
    }

    if (title.length > 200) {
      errors.push('title không được vượt quá 200 ký tự.');
    }

    if (raw.description.trim().length > 2000) {
      errors.push('description không được vượt quá 2000 ký tự.');
    }

    if (sprintId && status === TaskStatus.Backlog) {
      errors.push('Task có sprint không được để status BACKLOG.');
    }

    if (!sprintId && status !== TaskStatus.Backlog) {
      errors.push('Task chưa gán sprint chỉ được để status BACKLOG.');
    }

    if (status === TaskStatus.Cancelled) {
      errors.push('Không import task ở trạng thái CANCELLED.');
    }

    return {
      rowNumber,
      valid: errors.length === 0,
      errors,
      data: {
        rowNumber,
        title,
        description: raw.description.trim() || null,
        sprintId,
        sprintName: raw.sprintName.trim() || null,
        status,
        assigneeId,
        assigneeEmail: raw.assigneeEmail.trim() || null,
        dueDate,
        estimatedHours,
        storyPoints,
      },
      raw,
    };
  }

  private resolveImportSprintId(
    raw: ImportRawRow,
    context: ImportContext,
    errors: string[],
  ) {
    const sprintId = raw.sprintId.trim();
    const sprintName = raw.sprintName.trim();

    if (sprintId) {
      const sprint = context.sprintsById.get(sprintId);

      if (!sprint) {
        errors.push('sprintId không tồn tại trong project này.');
        return null;
      }

      this.assertImportSprintCanReceiveTask(sprint, errors);
      return sprint.id;
    }

    if (!sprintName) {
      return null;
    }

    const matchedSprints = context.sprintsByName.get(
      normalizeLookupText(sprintName),
    );

    if (!matchedSprints?.length) {
      errors.push('sprintName không khớp sprint nào trong project.');
      return null;
    }

    if (matchedSprints.length > 1) {
      errors.push('sprintName bị trùng, hãy dùng sprintId để tránh nhầm.');
      return null;
    }

    const sprint = matchedSprints[0];
    this.assertImportSprintCanReceiveTask(sprint, errors);
    return sprint.id;
  }

  private assertImportSprintCanReceiveTask(sprint: Sprint, errors: string[]) {
    if (
      sprint.status === SprintStatus.Completed ||
      sprint.status === SprintStatus.Cancelled
    ) {
      errors.push('Sprint đã hoàn thành/hủy không thể nhận thêm task.');
    }
  }

  private resolveImportAssigneeId(
    raw: ImportRawRow,
    context: ImportContext,
    errors: string[],
  ) {
    const assigneeId = raw.assigneeId.trim();
    const assigneeEmail = raw.assigneeEmail.trim().toLowerCase();

    if (assigneeId) {
      if (!context.membersById.has(assigneeId)) {
        errors.push('assigneeId không phải thành viên ACTIVE của workspace.');
        return null;
      }

      return assigneeId;
    }

    if (!assigneeEmail) {
      return null;
    }

    const member = context.membersByEmail.get(assigneeEmail);

    if (!member) {
      errors.push('assigneeEmail không phải thành viên ACTIVE của workspace.');
      return null;
    }

    return member.userId;
  }

  private resolveImportStatus(
    value: string,
    sprintId: string | null,
    errors: string[],
  ) {
    if (!value.trim()) {
      return sprintId ? TaskStatus.Todo : TaskStatus.Backlog;
    }

    const status = taskStatusLookup.get(normalizeLookupText(value));

    if (!status) {
      errors.push('status không hợp lệ.');
      return sprintId ? TaskStatus.Todo : TaskStatus.Backlog;
    }

    return status;
  }

  private resolveImportDate(value: string, errors: string[]) {
    const rawValue = value.trim();

    if (!rawValue) {
      return null;
    }

    const isoMatch = rawValue.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    const vnMatch = rawValue.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

    if (isoMatch) {
      return this.normalizeDateParts(
        Number(isoMatch[1]),
        Number(isoMatch[2]),
        Number(isoMatch[3]),
        errors,
      );
    }

    if (vnMatch) {
      return this.normalizeDateParts(
        Number(vnMatch[3]),
        Number(vnMatch[2]),
        Number(vnMatch[1]),
        errors,
      );
    }

    errors.push('dueDate phải theo định dạng YYYY-MM-DD.');
    return null;
  }

  private normalizeDateParts(
    year: number,
    month: number,
    day: number,
    errors: string[],
  ) {
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      errors.push('dueDate không phải ngày hợp lệ.');
      return null;
    }

    const monthText = String(month).padStart(2, '0');
    const dayText = String(day).padStart(2, '0');
    return `${year}-${monthText}-${dayText}`;
  }

  private resolveImportNumber(
    value: string,
    fieldName: string,
    errors: string[],
  ) {
    const rawValue = value.trim();

    if (!rawValue) {
      return null;
    }

    const numberValue = Number(rawValue.replace(',', '.'));

    if (!Number.isFinite(numberValue) || numberValue < 0) {
      errors.push(`${fieldName} phải là số không âm.`);
      return null;
    }

    return numberValue;
  }

  private resolveImportInteger(
    value: string,
    fieldName: string,
    errors: string[],
  ) {
    const numberValue = this.resolveImportNumber(value, fieldName, errors);

    if (numberValue === null) {
      return null;
    }

    if (!Number.isInteger(numberValue)) {
      errors.push(`${fieldName} phải là số nguyên.`);
      return null;
    }

    return numberValue;
  }

  private isEmptyImportRawRow(raw: ImportRawRow) {
    return importFields.every((field) => raw[field].trim() === '');
  }

  private cellToText(cell: ExcelJS.Cell) {
    const value = cell.value;

    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDateOnly(value);
    }

    if (typeof value === 'object') {
      const record = value as unknown as Record<string, unknown>;

      if (typeof record.text === 'string') {
        return record.text.trim();
      }

      if (record.result instanceof Date) {
        return this.formatDateOnly(record.result);
      }

      if (
        typeof record.result === 'string' ||
        typeof record.result === 'number'
      ) {
        return String(record.result).trim();
      }

      if (Array.isArray(record.richText)) {
        return record.richText
          .map((item) => {
            if (typeof item !== 'object' || item === null) {
              return '';
            }

            const richItem = item as Record<string, unknown>;
            return typeof richItem.text === 'string' ? richItem.text : '';
          })
          .join('')
          .trim();
      }
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value).trim();
    }

    return '';
  }

  private formatDateOnly(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async notifyNewlyUnblockedTasks(
    blocker: Task,
    workspaceId: string,
    projectId: string,
  ) {
    if (!this.taskDependenciesRepository || !this.notificationsService) return;
    const relations = await this.taskDependenciesRepository.findTasksUnblockedBy(blocker.id);
    const dependents = relations.map((item) =>
      item.sourceTaskId === blocker.id ? item.targetTask : item.sourceTask,
    );
    for (const task of dependents) {
      if (!task.assigneeId || [TaskStatus.Done, TaskStatus.Cancelled].includes(task.status)) continue;
      const remaining = await this.taskDependenciesRepository.findIncompleteBlockers(task.id);
      if (remaining.length) continue;
      await this.notificationsService.create({
        recipientId: task.assigneeId,
        type: NotificationType.TaskBlockerResolved,
        title: 'Công việc đã được gỡ chặn',
        body: `${task.taskCode} - ${task.title}`,
        link: `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`,
        metadata: { taskId: task.id, blockerTaskId: blocker.id },
        idempotencyKey: `TASK_BLOCKER_RESOLVED:${task.id}:${blocker.id}`,
      });
    }
  }

  private async assertWritableProject(workspaceId: string, projectId: string) {
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    return this.projectAccessService.assertProjectActive(
      projectId,
      workspaceId,
    );
  }

  private async assertTaskReadable(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    taskId: string,
  ) {
    await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
    await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
    return this.taskAccessService.assertTaskInProject(taskId, projectId);
  }

  private async requireOwnComment(
    currentUserId: string,
    taskId: string,
    commentId: string,
  ) {
    if (!this.taskCommentsRepository) {
      throw new BadRequestException('Task comments are unavailable');
    }
    const comment = await this.taskCommentsRepository.findById(commentId, taskId);
    if (!comment) throw new NotFoundException('Task comment not found');
    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException('You can only edit or delete your own comment');
    }
    return comment;
  }

  private async resolveMentionedUserIds(content: string, workspaceId: string) {
    const emails = new Set(
      Array.from(content.matchAll(/@([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)).map(
        (match) => match[1].toLowerCase(),
      ),
    );
    if (emails.size === 0) return [];
    const members = await this.workspaceMembersRepository.findActiveByWorkspace(workspaceId);
    return members
      .filter((member) => member.user?.email && emails.has(member.user.email.toLowerCase()))
      .map((member) => member.userId);
  }

  private toCommentResponse(comment: import('../entities/task-comment.entity').TaskComment) {
    return {
      id: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      mentionedUserIds: comment.mentionedUserIds ?? [],
      author: comment.author
        ? {
            id: comment.author.id,
            fullName: comment.author.fullName,
            email: comment.author.email,
            avatarUrl: comment.author.avatarUrl,
          }
        : { id: comment.authorId, fullName: '', email: '', avatarUrl: null },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  private recordActivity(
    task: Task,
    actorId: string,
    action: TaskActivityAction,
    changes: Record<string, { from: unknown; to: unknown }> | null = null,
  ) {
    if (!this.taskActivityLogsRepository) return Promise.resolve();
    return this.taskActivityLogsRepository.create({
      taskId: task.id,
      projectId: task.projectId,
      actorId,
      action,
      changes: changes && Object.keys(changes).length > 0 ? changes : null,
    });
  }

  private pickTaskFields(task: Task, fields: (keyof Task)[]) {
    return Object.fromEntries(fields.map((field) => [field, task[field]]));
  }

  private buildChanges(previous: Record<string, unknown>, task: Task) {
    return this.compactChanges(
      Object.fromEntries(
        Object.entries(previous).map(([field, from]) => [
          field,
          { from, to: task[field as keyof Task] },
        ]),
      ),
    );
  }

  private compactChanges(
    changes: Record<string, { from: unknown; to: unknown }>,
  ) {
    return Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value.from !== value.to),
    );
  }

  private assertBacklogStatusMatchesTaskLocation(
    task: Task,
    nextStatus: TaskStatus,
  ) {
    if (nextStatus === TaskStatus.Backlog && task.sprintId) {
      throw new BadRequestException(
        'Move task to backlog before setting BACKLOG status',
      );
    }
  }

  private async assertValidParent(
    parentId: string,
    projectId: string,
    childType: TaskType,
    currentTaskId?: string,
  ) {
    if (parentId === currentTaskId) throw new BadRequestException('Task can not be its own parent');
    if (childType === TaskType.Epic) throw new BadRequestException('EPIC can not have a parent');
    const parent = await this.taskAccessService.assertTaskInProject(parentId, projectId);
    if (parent.taskType === TaskType.Subtask) throw new BadRequestException('SUBTASK can not be a parent');
    if (childType === TaskType.Story && parent.taskType !== TaskType.Epic) {
      throw new BadRequestException('STORY parent must be an EPIC');
    }
    let ancestor = parent;
    const visited = new Set<string>();
    while (ancestor.parentId) {
      if (ancestor.parentId === currentTaskId) throw new BadRequestException('Task hierarchy can not contain a cycle');
      if (visited.has(ancestor.parentId)) throw new BadRequestException('Existing task hierarchy contains a cycle');
      visited.add(ancestor.parentId);
      ancestor = await this.taskAccessService.assertTaskInProject(ancestor.parentId, projectId);
    }
    return parent;
  }

  private normalizeLabels(labels?: string[]) {
    if (!labels?.length) return null;
    return [...new Set(labels.map((label) => label.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
  }

  private toTaskResponse(task: Task) {
    return {
      id: task.id,
      projectId: task.projectId,
      sprintId: task.sprintId,
      taskCode: task.taskCode,
      title: task.title,
      description: task.description,
      labels: task.labels ?? [],
      acceptanceCriteria: task.acceptanceCriteria,
      status: task.status,
      workflowStatusId: task.workflowStatusId,
      taskType: task.taskType ?? TaskType.Task,
      priority: task.priority ?? TaskPriority.Medium,
      parentId: task.parentId ?? null,
      parent: task.parent ? { id: task.parent.id, taskCode: task.parent.taskCode, title: task.parent.title, taskType: task.parent.taskType } : null,
      children: task.children?.map((child) => ({ id: child.id, taskCode: child.taskCode, title: child.title, taskType: child.taskType, status: child.status })) ?? [],
      childProgress: task.children?.length ? {
        total: task.children.length,
        done: task.children.filter((child) => child.status === TaskStatus.Done).length,
        percent: Math.round((task.children.filter((child) => child.status === TaskStatus.Done).length / task.children.length) * 100),
      } : null,
      assigneeId: task.assigneeId,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            fullName: task.assignee.fullName,
            email: task.assignee.email,
            avatarUrl: task.assignee.avatarUrl,
          }
        : null,
      reporterId: task.reporterId,
      reporter: task.reporter ? { id: task.reporter.id, fullName: task.reporter.fullName, email: task.reporter.email, avatarUrl: task.reporter.avatarUrl } : null,
      createdBy: task.createdBy,
      creator: task.creator
        ? {
            id: task.creator.id,
            fullName: task.creator.fullName,
            email: task.creator.email,
          }
        : null,
      sprint: task.sprint
        ? {
            id: task.sprint.id,
            name: task.sprint.name,
            status: task.sprint.status,
          }
        : null,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      storyPoints: task.storyPoints,
      completedAt: task.completedAt,
      startedAt: task.startedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      isBlocked: task.isBlocked ?? false,
      isBlocking: task.isBlocking ?? false,
    };
  }
}
