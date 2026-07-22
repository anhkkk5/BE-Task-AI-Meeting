"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const exceljs_1 = __importDefault(require("exceljs"));
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const project_access_service_1 = require("../../projects/services/project-access.service");
const sprints_repository_1 = require("../../sprints/repositories/sprints.repository");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const tasks_repository_1 = require("../repositories/tasks.repository");
const task_access_service_1 = require("./task-access.service");
const task_code_service_1 = require("./task-code.service");
const importFields = [
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
const importHeaderAliases = {
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
const taskStatusLookup = new Map([
    ['backlog', task_status_enum_1.TaskStatus.Backlog],
    ['todo', task_status_enum_1.TaskStatus.Todo],
    ['canlam', task_status_enum_1.TaskStatus.Todo],
    ['dangcho', task_status_enum_1.TaskStatus.Todo],
    ['inprogress', task_status_enum_1.TaskStatus.InProgress],
    ['danglam', task_status_enum_1.TaskStatus.InProgress],
    ['review', task_status_enum_1.TaskStatus.Review],
    ['dangreview', task_status_enum_1.TaskStatus.Review],
    ['done', task_status_enum_1.TaskStatus.Done],
    ['hoanthanh', task_status_enum_1.TaskStatus.Done],
    ['cancelled', task_status_enum_1.TaskStatus.Cancelled],
    ['canceled', task_status_enum_1.TaskStatus.Cancelled],
    ['dahuy', task_status_enum_1.TaskStatus.Cancelled],
]);
const normalizedImportHeaders = new Map(importFields.flatMap((field) => importHeaderAliases[field].map((alias) => [
    normalizeLookupText(alias),
    field,
])));
function normalizeLookupText(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}
let TasksService = class TasksService {
    tasksRepository;
    taskAccessService;
    taskCodeService;
    workspaceAccessService;
    projectAccessService;
    workspaceMembersRepository;
    sprintsRepository;
    constructor(tasksRepository, taskAccessService, taskCodeService, workspaceAccessService, projectAccessService, workspaceMembersRepository, sprintsRepository) {
        this.tasksRepository = tasksRepository;
        this.taskAccessService = taskAccessService;
        this.taskCodeService = taskCodeService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.sprintsRepository = sprintsRepository;
    }
    async createTask(currentUserId, workspaceId, projectId, dto) {
        const project = await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        if (dto.sprintId) {
            await this.taskAccessService.assertSprintCanReceiveTask(dto.sprintId, projectId);
        }
        if (dto.assigneeId) {
            await this.taskAccessService.assertAssignableUser(dto.assigneeId, workspaceId);
        }
        const taskCode = await this.taskCodeService.generateTaskCode(project);
        const task = await this.tasksRepository.create({
            projectId,
            sprintId: dto.sprintId ?? null,
            taskCode,
            title: dto.title.trim(),
            description: dto.description?.trim() || null,
            status: dto.sprintId ? task_status_enum_1.TaskStatus.Todo : task_status_enum_1.TaskStatus.Backlog,
            assigneeId: dto.assigneeId ?? null,
            createdBy: currentUserId,
            dueDate: dto.dueDate ?? null,
            estimatedHours: dto.estimatedHours ?? null,
            storyPoints: dto.storyPoints ?? null,
        });
        return {
            success: true,
            message: 'Create task successfully',
            data: {
                task: this.toTaskResponse(task),
            },
        };
    }
    async createTaskImportTemplate(currentUserId, workspaceId, projectId) {
        const project = await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const context = await this.buildImportContext(workspaceId, projectId);
        const workbook = new exceljs_1.default.Workbook();
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
                value: 'BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE. Không import CANCELLED.',
            },
            {
                name: 'Priority',
                value: 'LOW, MEDIUM, HIGH, URGENT.',
            },
            {
                name: 'Sprint',
                value: 'Điền sprintId để chắc chắn nhất. Nếu dùng sprintName thì tên sprint phải không bị trùng.',
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
    async previewTaskImport(currentUserId, workspaceId, projectId, file) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        if (!file?.buffer) {
            throw new common_1.BadRequestException('Vui lòng chọn file Excel.');
        }
        if (file.size && file.size > 2 * 1024 * 1024) {
            throw new common_1.BadRequestException('File Excel không được vượt quá 2MB.');
        }
        const workbook = new exceljs_1.default.Workbook();
        await workbook.xlsx.load(Uint8Array.from(file.buffer).buffer);
        const worksheet = workbook.getWorksheet('Backlog import') ?? workbook.worksheets[0];
        if (!worksheet) {
            throw new common_1.BadRequestException('File Excel không có worksheet dữ liệu.');
        }
        const headerMap = this.getImportHeaderMap(worksheet.getRow(1));
        if (!headerMap.has('title')) {
            throw new common_1.BadRequestException('File Excel thiếu cột title.');
        }
        const context = await this.buildImportContext(workspaceId, projectId);
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            const raw = this.readImportRawRow(row, headerMap);
            if (this.isEmptyImportRawRow(raw))
                return;
            rows.push(this.validateImportRawRow(rowNumber, raw, context));
        });
        if (rows.length > 200) {
            throw new common_1.BadRequestException('Mỗi lần chỉ import tối đa 200 dòng task.');
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
    async commitTaskImport(currentUserId, workspaceId, projectId, dto) {
        const project = await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const context = await this.buildImportContext(workspaceId, projectId);
        const checkedRows = dto.items.map((item, index) => this.validateImportRawRow(item.rowNumber ?? index + 2, this.importItemToRawRow(item), context));
        const invalidMessages = checkedRows.flatMap((row) => row.errors.map((error) => `Dòng ${row.rowNumber}: ${error}`));
        if (invalidMessages.length > 0) {
            throw new common_1.BadRequestException(invalidMessages);
        }
        const tasks = [];
        for (const row of checkedRows) {
            const item = row.data;
            const taskCode = await this.taskCodeService.generateTaskCode(project);
            const task = await this.tasksRepository.create({
                projectId,
                sprintId: item.sprintId ?? null,
                taskCode,
                title: item.title.trim(),
                description: item.description?.trim() || null,
                status: item.status ?? (item.sprintId ? task_status_enum_1.TaskStatus.Todo : task_status_enum_1.TaskStatus.Backlog),
                assigneeId: item.assigneeId ?? null,
                createdBy: currentUserId,
                dueDate: item.dueDate ?? null,
                estimatedHours: item.estimatedHours ?? null,
                storyPoints: item.storyPoints ?? null,
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
    async getTasks(currentUserId, workspaceId, projectId, query) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        if (query.sprintId) {
            await this.taskAccessService.assertSprintInProject(query.sprintId, projectId);
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
    async getBacklogTasks(currentUserId, workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const items = await this.tasksRepository.findBacklogByProject(projectId);
        return {
            success: true,
            message: 'Get backlog tasks successfully',
            data: {
                items: items.map((task) => this.toTaskResponse(task)),
            },
        };
    }
    async getSprintTasks(currentUserId, workspaceId, projectId, sprintId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
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
    async getTaskDetail(currentUserId, workspaceId, projectId, taskId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        return {
            success: true,
            message: 'Get task detail successfully',
            data: {
                task: this.toTaskResponse(task),
            },
        };
    }
    async updateTask(currentUserId, workspaceId, projectId, taskId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        const updatedTask = await this.tasksRepository.update(task, {
            title: dto.title?.trim() ?? task.title,
            description: dto.description === undefined
                ? task.description
                : dto.description.trim() || null,
            dueDate: dto.dueDate ?? task.dueDate,
            estimatedHours: dto.estimatedHours ?? task.estimatedHours,
            storyPoints: dto.storyPoints ?? task.storyPoints,
        });
        return {
            success: true,
            message: 'Update task successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async updateTaskStatus(currentUserId, workspaceId, projectId, taskId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        await this.taskAccessService.assertUserCanUpdateTaskStatus(currentUserId, workspaceId, task, dto.status);
        this.assertBacklogStatusMatchesTaskLocation(task, dto.status);
        const updatedTask = await this.tasksRepository.update(task, {
            status: dto.status,
        });
        return {
            success: true,
            message: 'Update task status successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async assignTask(currentUserId, workspaceId, projectId, taskId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        if (dto.assigneeId) {
            await this.taskAccessService.assertAssignableUser(dto.assigneeId, workspaceId);
        }
        const updatedTask = await this.tasksRepository.update(task, {
            assigneeId: dto.assigneeId,
        });
        return {
            success: true,
            message: 'Assign task successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async moveTaskToSprint(currentUserId, workspaceId, projectId, taskId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        if (dto.sprintId) {
            await this.taskAccessService.assertSprintCanReceiveTask(dto.sprintId, projectId);
        }
        const updatedTask = await this.tasksRepository.update(task, {
            sprintId: dto.sprintId,
            status: dto.sprintId
                ? task.status === task_status_enum_1.TaskStatus.Backlog
                    ? task_status_enum_1.TaskStatus.Todo
                    : task.status
                : task_status_enum_1.TaskStatus.Backlog,
        });
        return {
            success: true,
            message: 'Move task sprint successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async cancelTask(currentUserId, workspaceId, projectId, taskId) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        this.taskAccessService.assertTaskEditable(task);
        const updatedTask = await this.tasksRepository.update(task, {
            status: task_status_enum_1.TaskStatus.Cancelled,
        });
        return {
            success: true,
            message: 'Cancel task successfully',
            data: {
                task: this.toTaskResponse(updatedTask),
            },
        };
    }
    async deleteTask(currentUserId, workspaceId, projectId, taskId) {
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const task = await this.taskAccessService.assertTaskInProject(taskId, projectId);
        await this.taskAccessService.assertUserCanDeleteTask(currentUserId, workspaceId, task);
        await this.tasksRepository.softDelete(task);
        return {
            success: true,
            message: 'Delete task successfully',
            data: null,
        };
    }
    async buildImportContext(workspaceId, projectId) {
        const [members, sprintsResult] = await Promise.all([
            this.workspaceMembersRepository.findActiveByWorkspace(workspaceId),
            this.sprintsRepository.findByProject(projectId, { page: 1, limit: 500 }),
        ]);
        const membersById = new Map();
        const membersByEmail = new Map();
        const sprintsById = new Map();
        const sprintsByName = new Map();
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
    getImportHeaderMap(row) {
        const headerMap = new Map();
        row.eachCell((cell, columnNumber) => {
            const field = normalizedImportHeaders.get(normalizeLookupText(this.cellToText(cell)));
            if (field && !headerMap.has(field)) {
                headerMap.set(field, columnNumber);
            }
        });
        return headerMap;
    }
    readImportRawRow(row, headerMap) {
        const raw = {};
        importFields.forEach((field) => {
            const columnNumber = headerMap.get(field);
            raw[field] = columnNumber
                ? this.cellToText(row.getCell(columnNumber))
                : '';
        });
        return raw;
    }
    importItemToRawRow(item) {
        return {
            title: item.title ?? '',
            description: item.description ?? '',
            sprintId: item.sprintId ?? '',
            sprintName: item.sprintName ?? '',
            status: item.status ?? '',
            assigneeId: item.assigneeId ?? '',
            assigneeEmail: item.assigneeEmail ?? '',
            dueDate: item.dueDate ?? '',
            estimatedHours: item.estimatedHours === null || item.estimatedHours === undefined
                ? ''
                : String(item.estimatedHours),
            storyPoints: item.storyPoints === null || item.storyPoints === undefined
                ? ''
                : String(item.storyPoints),
        };
    }
    validateImportRawRow(rowNumber, raw, context) {
        const errors = [];
        const title = raw.title.trim();
        const sprintId = this.resolveImportSprintId(raw, context, errors);
        const assigneeId = this.resolveImportAssigneeId(raw, context, errors);
        const status = this.resolveImportStatus(raw.status, sprintId, errors);
        const dueDate = this.resolveImportDate(raw.dueDate, errors);
        const estimatedHours = this.resolveImportNumber(raw.estimatedHours, 'estimatedHours', errors);
        const storyPoints = this.resolveImportInteger(raw.storyPoints, 'storyPoints', errors);
        if (title.length < 2) {
            errors.push('title phải có ít nhất 2 ký tự.');
        }
        if (title.length > 200) {
            errors.push('title không được vượt quá 200 ký tự.');
        }
        if (raw.description.trim().length > 2000) {
            errors.push('description không được vượt quá 2000 ký tự.');
        }
        if (sprintId && status === task_status_enum_1.TaskStatus.Backlog) {
            errors.push('Task có sprint không được để status BACKLOG.');
        }
        if (!sprintId && status !== task_status_enum_1.TaskStatus.Backlog) {
            errors.push('Task chưa gán sprint chỉ được để status BACKLOG.');
        }
        if (status === task_status_enum_1.TaskStatus.Cancelled) {
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
    resolveImportSprintId(raw, context, errors) {
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
        const matchedSprints = context.sprintsByName.get(normalizeLookupText(sprintName));
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
    assertImportSprintCanReceiveTask(sprint, errors) {
        if (sprint.status === sprint_status_enum_1.SprintStatus.Completed ||
            sprint.status === sprint_status_enum_1.SprintStatus.Cancelled) {
            errors.push('Sprint đã hoàn thành/hủy không thể nhận thêm task.');
        }
    }
    resolveImportAssigneeId(raw, context, errors) {
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
    resolveImportStatus(value, sprintId, errors) {
        if (!value.trim()) {
            return sprintId ? task_status_enum_1.TaskStatus.Todo : task_status_enum_1.TaskStatus.Backlog;
        }
        const status = taskStatusLookup.get(normalizeLookupText(value));
        if (!status) {
            errors.push('status không hợp lệ.');
            return sprintId ? task_status_enum_1.TaskStatus.Todo : task_status_enum_1.TaskStatus.Backlog;
        }
        return status;
    }
    resolveImportDate(value, errors) {
        const rawValue = value.trim();
        if (!rawValue) {
            return null;
        }
        const isoMatch = rawValue.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
        const vnMatch = rawValue.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
        if (isoMatch) {
            return this.normalizeDateParts(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]), errors);
        }
        if (vnMatch) {
            return this.normalizeDateParts(Number(vnMatch[3]), Number(vnMatch[2]), Number(vnMatch[1]), errors);
        }
        errors.push('dueDate phải theo định dạng YYYY-MM-DD.');
        return null;
    }
    normalizeDateParts(year, month, day, errors) {
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day) {
            errors.push('dueDate không phải ngày hợp lệ.');
            return null;
        }
        const monthText = String(month).padStart(2, '0');
        const dayText = String(day).padStart(2, '0');
        return `${year}-${monthText}-${dayText}`;
    }
    resolveImportNumber(value, fieldName, errors) {
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
    resolveImportInteger(value, fieldName, errors) {
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
    isEmptyImportRawRow(raw) {
        return importFields.every((field) => raw[field].trim() === '');
    }
    cellToText(cell) {
        const value = cell.value;
        if (value === null || value === undefined) {
            return '';
        }
        if (value instanceof Date) {
            return this.formatDateOnly(value);
        }
        if (typeof value === 'object') {
            const record = value;
            if (typeof record.text === 'string') {
                return record.text.trim();
            }
            if (record.result instanceof Date) {
                return this.formatDateOnly(record.result);
            }
            if (typeof record.result === 'string' ||
                typeof record.result === 'number') {
                return String(record.result).trim();
            }
            if (Array.isArray(record.richText)) {
                return record.richText
                    .map((item) => {
                    if (typeof item !== 'object' || item === null) {
                        return '';
                    }
                    const richItem = item;
                    return typeof richItem.text === 'string' ? richItem.text : '';
                })
                    .join('')
                    .trim();
            }
        }
        if (typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean') {
            return String(value).trim();
        }
        return '';
    }
    formatDateOnly(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    async assertWritableProject(workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        return this.projectAccessService.assertProjectActive(projectId, workspaceId);
    }
    assertBacklogStatusMatchesTaskLocation(task, nextStatus) {
        if (nextStatus === task_status_enum_1.TaskStatus.Backlog && task.sprintId) {
            throw new common_1.BadRequestException('Move task to backlog before setting BACKLOG status');
        }
    }
    toTaskResponse(task) {
        return {
            id: task.id,
            projectId: task.projectId,
            sprintId: task.sprintId,
            taskCode: task.taskCode,
            title: task.title,
            description: task.description,
            status: task.status,
            assigneeId: task.assigneeId,
            assignee: task.assignee
                ? {
                    id: task.assignee.id,
                    fullName: task.assignee.fullName,
                    email: task.assignee.email,
                    avatarUrl: task.assignee.avatarUrl,
                }
                : null,
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
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tasks_repository_1.TasksRepository,
        task_access_service_1.TaskAccessService,
        task_code_service_1.TaskCodeService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService,
        workspace_members_repository_1.WorkspaceMembersRepository,
        sprints_repository_1.SprintsRepository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map