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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const project_status_enum_1 = require("../../../common/enums/project-status.enum");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const stats_repository_1 = require("../repositories/stats.repository");
const UPCOMING_TASK_LIMIT = 5;
const PRODUCTIVITY_DAYS = 7;
let StatsService = class StatsService {
    statsRepository;
    workspaceMembersRepository;
    workspaceAccessService;
    constructor(statsRepository, workspaceMembersRepository, workspaceAccessService) {
        this.statsRepository = statsRepository;
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.workspaceAccessService = workspaceAccessService;
    }
    async getWorkspacesOverview(userId) {
        const members = await this.workspaceMembersRepository.findActiveByUser(userId);
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
        const [projectCounts, memberCounts, taskCounts, meetingCounts, distinctMembers,] = await Promise.all([
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
    async getWorkspaceDashboard(userId, workspaceId) {
        await this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(fromDate.getDate() - (PRODUCTIVITY_DAYS - 1));
        fromDate.setHours(0, 0, 0, 0);
        const [projectStatusCounts, taskStatusCounts, members, activeSprint, upcomingTasks, completedByDay, upcomingMeetings,] = await Promise.all([
            this.statsRepository.countProjectsByStatus(workspaceId),
            this.statsRepository.countTasksByStatus(workspaceId),
            this.workspaceMembersRepository.findActiveByWorkspace(workspaceId),
            this.statsRepository.findActiveSprint(workspaceId),
            this.statsRepository.findUpcomingTasks(workspaceId, UPCOMING_TASK_LIMIT),
            this.statsRepository.countCompletedTasksByDay(workspaceId, fromDate),
            this.statsRepository.countUpcomingMeetings(workspaceId, this.toDateOnly(today)),
        ]);
        const projectStatusMap = this.toStatusMap(projectStatusCounts);
        const taskStatusMap = this.toStatusMap(taskStatusCounts);
        const totalTasks = this.sumMap(taskStatusMap);
        const doneTasks = taskStatusMap.get(task_status_enum_1.TaskStatus.Done) ?? 0;
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
                    activeProjects: projectStatusMap.get(project_status_enum_1.ProjectStatus.Active) ?? 0,
                    completedProjects: projectStatusMap.get(project_status_enum_1.ProjectStatus.Completed) ?? 0,
                    totalTasks,
                    doneTasks,
                    totalMembers: members.length,
                    upcomingMeetings,
                    completionRate: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
                },
                taskStatusBreakdown: Object.values(task_status_enum_1.TaskStatus).map((status) => ({
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
    async buildSprintProgress(sprintId, sprint) {
        const counts = await this.statsRepository.countSprintTasksByStatus(sprintId);
        const statusMap = this.toStatusMap(counts);
        const total = this.sumMap(statusMap);
        const done = statusMap.get(task_status_enum_1.TaskStatus.Done) ?? 0;
        return {
            ...sprint,
            totalTasks: total,
            doneTasks: done,
            progress: total === 0 ? 0 : Math.round((done / total) * 100),
        };
    }
    buildProductivitySeries(rows, fromDate) {
        const counts = new Map();
        rows.forEach((row) => {
            const day = row.day instanceof Date
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
    toCountMap(rows) {
        return new Map(rows.map((row) => [row.workspaceId, Number(row.total)]));
    }
    toStatusMap(rows) {
        return new Map(rows.map((row) => [row.status, Number(row.total)]));
    }
    sumMap(map) {
        let total = 0;
        map.forEach((value) => {
            total += value;
        });
        return total;
    }
    toDateOnly(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stats_repository_1.StatsRepository,
        workspace_members_repository_1.WorkspaceMembersRepository,
        workspace_access_service_1.WorkspaceAccessService])
], StatsService);
//# sourceMappingURL=stats.service.js.map