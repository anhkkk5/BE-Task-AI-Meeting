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
exports.AiTeamReportDataBuilderService = void 0;
const common_1 = require("@nestjs/common");
const task_priority_enum_1 = require("../../../common/enums/task-priority.enum");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const daily_updates_repository_1 = require("../../daily-updates/repositories/daily-updates.repository");
const project_access_service_1 = require("../../projects/services/project-access.service");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
let AiTeamReportDataBuilderService = class AiTeamReportDataBuilderService {
    dailyUpdatesRepository;
    projectAccessService;
    sprintAccessService;
    tasksRepository;
    workspaceAccessService;
    workspaceMembersRepository;
    constructor(dailyUpdatesRepository, projectAccessService, sprintAccessService, tasksRepository, workspaceAccessService, workspaceMembersRepository) {
        this.dailyUpdatesRepository = dailyUpdatesRepository;
        this.projectAccessService = projectAccessService;
        this.sprintAccessService = sprintAccessService;
        this.tasksRepository = tasksRepository;
        this.workspaceAccessService = workspaceAccessService;
        this.workspaceMembersRepository = workspaceMembersRepository;
    }
    async buildTeamReportInput(params) {
        const workspace = await this.workspaceAccessService.assertWorkspaceActive(params.workspaceId);
        const project = await this.projectAccessService.assertProjectInWorkspace(params.projectId, params.workspaceId);
        const sprint = params.sprintId
            ? await this.sprintAccessService.assertSprintInProject(params.sprintId, params.projectId)
            : null;
        const reportDate = this.normalizeDate(params.reportDate);
        const members = await this.getTeamMembers(params.workspaceId);
        const dailyUpdates = await this.getTeamDailyUpdates(params.projectId, reportDate, params.sprintId);
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
            missingDailyUpdateMembers: this.getMissingDailyUpdateMembers(members, dailyUpdates),
            taskStats: this.getTaskStats(tasks),
            tasks,
            overdueTasks: this.getOverdueTasks(tasks, reportDate),
            highPriorityTasks: tasks.filter((task) => [task_priority_enum_1.TaskPriority.High, task_priority_enum_1.TaskPriority.Urgent].includes(task.priority)),
            blockers: dailyUpdates
                .filter((dailyUpdate) => Boolean(dailyUpdate.blockers?.trim()))
                .map((dailyUpdate) => ({
                userId: dailyUpdate.userId,
                fullName: dailyUpdate.fullName,
                blocker: dailyUpdate.blockers?.trim() ?? '',
            })),
        };
    }
    async getTeamMembers(workspaceId) {
        const members = await this.workspaceMembersRepository.findActiveByWorkspace(workspaceId);
        return members.map((member) => ({
            userId: member.userId,
            fullName: member.user?.fullName ?? member.user?.email ?? member.userId,
            email: member.user?.email ?? null,
            role: member.role,
        }));
    }
    async getTeamDailyUpdates(projectId, reportDate, sprintId) {
        const result = await this.dailyUpdatesRepository.findTeam(projectId, {
            date: reportDate,
            sprintId,
            page: 1,
            limit: 100,
        });
        return result.items.map((dailyUpdate) => ({
            id: dailyUpdate.id,
            userId: dailyUpdate.userId,
            fullName: dailyUpdate.user?.fullName ??
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
    async getTeamTasks(projectId, sprintId) {
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
            assigneeName: task.assignee?.fullName ?? task.assignee?.email ?? task.assigneeId,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            storyPoints: task.storyPoints,
        }));
    }
    getTaskStats(tasks) {
        const stats = {
            [task_status_enum_1.TaskStatus.Backlog]: 0,
            [task_status_enum_1.TaskStatus.Todo]: 0,
            [task_status_enum_1.TaskStatus.InProgress]: 0,
            [task_status_enum_1.TaskStatus.Review]: 0,
            [task_status_enum_1.TaskStatus.Done]: 0,
            [task_status_enum_1.TaskStatus.Cancelled]: 0,
        };
        tasks.forEach((task) => {
            stats[task.status] =
                (stats[task.status] ?? 0) + 1;
        });
        return stats;
    }
    getOverdueTasks(tasks, reportDate) {
        return tasks.filter((task) => Boolean(task.dueDate) &&
            task.dueDate < reportDate &&
            ![task_status_enum_1.TaskStatus.Done, task_status_enum_1.TaskStatus.Cancelled].includes(task.status));
    }
    getMissingDailyUpdateMembers(members, dailyUpdates) {
        const updatedUserIds = new Set(dailyUpdates.map((dailyUpdate) => dailyUpdate.userId));
        return members.filter((member) => !updatedUserIds.has(member.userId));
    }
    normalizeDate(value) {
        return value.slice(0, 10);
    }
};
exports.AiTeamReportDataBuilderService = AiTeamReportDataBuilderService;
exports.AiTeamReportDataBuilderService = AiTeamReportDataBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [daily_updates_repository_1.DailyUpdatesRepository,
        project_access_service_1.ProjectAccessService,
        sprint_access_service_1.SprintAccessService,
        tasks_repository_1.TasksRepository,
        workspace_access_service_1.WorkspaceAccessService,
        workspace_members_repository_1.WorkspaceMembersRepository])
], AiTeamReportDataBuilderService);
//# sourceMappingURL=ai-team-report-data-builder.service.js.map