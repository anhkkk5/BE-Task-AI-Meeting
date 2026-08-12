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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReportDataBuilderService = void 0;
const common_1 = require("@nestjs/common");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const daily_updates_repository_1 = require("../../daily-updates/repositories/daily-updates.repository");
const project_access_service_1 = require("../../projects/services/project-access.service");
const shift_handovers_repository_1 = require("../../shift-handovers/repositories/shift-handovers.repository");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const users_service_1 = require("../../users/services/users.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
let AiReportDataBuilderService = class AiReportDataBuilderService {
    dailyUpdatesRepository;
    projectAccessService;
    sprintAccessService;
    tasksRepository;
    usersService;
    workspaceAccessService;
    shiftHandoversRepository;
    constructor(dailyUpdatesRepository, projectAccessService, sprintAccessService, tasksRepository, usersService, workspaceAccessService, shiftHandoversRepository) {
        this.dailyUpdatesRepository = dailyUpdatesRepository;
        this.projectAccessService = projectAccessService;
        this.sprintAccessService = sprintAccessService;
        this.tasksRepository = tasksRepository;
        this.usersService = usersService;
        this.workspaceAccessService = workspaceAccessService;
        this.shiftHandoversRepository = shiftHandoversRepository;
    }
    async buildPersonalDailyReportInput(params) {
        const workspace = await this.workspaceAccessService.assertWorkspaceActive(params.workspaceId);
        const targetMember = await this.workspaceAccessService.assertWorkspaceMember(params.targetUserId, params.workspaceId);
        const user = await this.usersService.findById(params.targetUserId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const project = await this.projectAccessService.assertProjectInWorkspace(params.projectId, params.workspaceId);
        const sprint = params.sprintId
            ? await this.sprintAccessService.assertSprintInProject(params.sprintId, params.projectId)
            : null;
        const reportDate = this.normalizeDate(params.reportDate);
        const dailyUpdates = await this.dailyUpdatesRepository.findMy(params.projectId, params.targetUserId, {
            date: reportDate,
            sprintId: params.sprintId,
            page: 1,
            limit: 1,
        });
        const tasks = await this.tasksRepository.findByProject(params.projectId, {
            assigneeId: params.targetUserId,
            sprintId: params.sprintId,
            page: 1,
            limit: 100,
        });
        const dayHandovers = await this.shiftHandoversRepository.findByProjectAndDate(params.projectId, reportDate);
        const pendingHandovers = await this.shiftHandoversRepository.findPendingByReceiver(params.targetUserId, params.workspaceId);
        const normalizedTasks = tasks.items.map((task) => ({
            id: task.id,
            taskCode: task.taskCode,
            title: task.title,
            status: task.status,
            workflowStatusId: task.workflowStatusId,
            workflowStatusKey: task.workflowStatusKey ?? task.status,
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
            handovers: {
                given: dayHandovers
                    .filter((handover) => handover.senderId === params.targetUserId)
                    .map((handover) => this.toHandoverItem(handover, handover.receiver?.fullName ?? null)),
                received: dayHandovers
                    .filter((handover) => handover.receiverId === params.targetUserId)
                    .map((handover) => this.toHandoverItem(handover, handover.sender?.fullName ?? null)),
                pendingForMe: pendingHandovers.length,
            },
            taskSummary: {
                completed: normalizedTasks
                    .filter((task) => task.status === task_status_enum_1.TaskStatus.Done)
                    .map((task) => `${task.taskCode} - ${task.title}`),
                inProgress: normalizedTasks
                    .filter((task) => [task_status_enum_1.TaskStatus.InProgress, task_status_enum_1.TaskStatus.Review].includes(task.status))
                    .map((task) => `${task.taskCode} - ${task.title}`),
                overdue: normalizedTasks
                    .filter((task) => Boolean(task.dueDate) &&
                    task.dueDate < reportDate &&
                    ![task_status_enum_1.TaskStatus.Done, task_status_enum_1.TaskStatus.Cancelled].includes(task.status))
                    .map((task) => `${task.taskCode} - ${task.title}`),
            },
        };
    }
    toHandoverItem(handover, counterpartName) {
        return {
            id: handover.id,
            taskCode: handover.task?.taskCode ?? null,
            taskTitle: handover.task?.title ?? null,
            status: handover.status,
            counterpartName,
            completedWork: handover.completedWork ?? null,
            remainingWork: handover.remainingWork ?? null,
            blockers: handover.blockers ?? null,
            notes: handover.notes ?? null,
        };
    }
    normalizeDate(value) {
        return value.slice(0, 10);
    }
};
exports.AiReportDataBuilderService = AiReportDataBuilderService;
exports.AiReportDataBuilderService = AiReportDataBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [daily_updates_repository_1.DailyUpdatesRepository,
        project_access_service_1.ProjectAccessService,
        sprint_access_service_1.SprintAccessService,
        tasks_repository_1.TasksRepository,
        users_service_1.UsersService,
        workspace_access_service_1.WorkspaceAccessService,
        shift_handovers_repository_1.ShiftHandoversRepository])
], AiReportDataBuilderService);
//# sourceMappingURL=ai-report-data-builder.service.js.map