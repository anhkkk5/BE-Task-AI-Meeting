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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiTeamReportDataBuilderService = exports.DEFAULT_TEAM_REPORT_DATA_SOURCES = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const handover_status_enum_1 = require("../../../common/enums/handover-status.enum");
const ai_report_type_enum_1 = require("../../../common/enums/ai-report-type.enum");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const daily_updates_repository_1 = require("../../daily-updates/repositories/daily-updates.repository");
const project_access_service_1 = require("../../projects/services/project-access.service");
const shift_handovers_repository_1 = require("../../shift-handovers/repositories/shift-handovers.repository");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const meetings_repository_1 = require("../../meetings/repositories/meetings.repository");
const ai_report_schema_1 = require("../schemas/ai-report.schema");
const meeting_summary_schema_1 = require("../schemas/meeting-summary.schema");
exports.DEFAULT_TEAM_REPORT_DATA_SOURCES = {
    tasks: true,
    dailyUpdates: true,
    meetingTranscripts: true,
    previousReport: false,
};
let AiTeamReportDataBuilderService = class AiTeamReportDataBuilderService {
    dailyUpdatesRepository;
    projectAccessService;
    sprintAccessService;
    tasksRepository;
    workspaceAccessService;
    workspaceMembersRepository;
    shiftHandoversRepository;
    meetingsRepository;
    meetingSummaryModel;
    aiReportModel;
    constructor(dailyUpdatesRepository, projectAccessService, sprintAccessService, tasksRepository, workspaceAccessService, workspaceMembersRepository, shiftHandoversRepository, meetingsRepository, meetingSummaryModel, aiReportModel) {
        this.dailyUpdatesRepository = dailyUpdatesRepository;
        this.projectAccessService = projectAccessService;
        this.sprintAccessService = sprintAccessService;
        this.tasksRepository = tasksRepository;
        this.workspaceAccessService = workspaceAccessService;
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.shiftHandoversRepository = shiftHandoversRepository;
        this.meetingsRepository = meetingsRepository;
        this.meetingSummaryModel = meetingSummaryModel;
        this.aiReportModel = aiReportModel;
    }
    async buildTeamReportInput(params) {
        const dataSources = this.resolveDataSources(params.dataSources);
        const workspace = await this.workspaceAccessService.assertWorkspaceActive(params.workspaceId);
        const project = await this.projectAccessService.assertProjectInWorkspace(params.projectId, params.workspaceId);
        const sprint = params.sprintId
            ? await this.sprintAccessService.assertSprintInProject(params.sprintId, params.projectId)
            : null;
        const reportDate = this.normalizeDate(params.reportDate);
        const members = await this.getTeamMembers(params.workspaceId);
        const dailyUpdates = dataSources.dailyUpdates
            ? await this.getTeamDailyUpdates(params.projectId, reportDate, params.sprintId)
            : [];
        const tasks = dataSources.tasks
            ? await this.getTeamTasks(params.projectId, params.sprintId)
            : [];
        const handovers = await this.getTeamHandovers(params.projectId, reportDate);
        const meetingNotes = dataSources.meetingTranscripts
            ? await this.getTeamMeetingNotes(params.projectId, reportDate)
            : [];
        const previousReport = dataSources.previousReport
            ? await this.getPreviousTeamReport(params.workspaceId, params.projectId, reportDate)
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
        };
    }
    resolveDataSources(dataSources) {
        return {
            ...exports.DEFAULT_TEAM_REPORT_DATA_SOURCES,
            ...(dataSources ?? {}),
        };
    }
    computeMetrics(inputData) {
        const activeTasks = inputData.tasks.filter((task) => task.status !== task_status_enum_1.TaskStatus.Cancelled);
        const doneTasks = activeTasks.filter((task) => task.status === task_status_enum_1.TaskStatus.Done).length;
        const inProgressTasks = activeTasks.filter((task) => [task_status_enum_1.TaskStatus.InProgress, task_status_enum_1.TaskStatus.Review].includes(task.status)).length;
        const handoverBlockers = inputData.handovers.filter((handover) => Boolean(handover.blockers?.trim())).length;
        return {
            doneTasks,
            totalTasks: activeTasks.length,
            inProgressTasks,
            blockerCount: inputData.blockers.length + handoverBlockers,
            progressPercent: activeTasks.length
                ? Math.round((doneTasks / activeTasks.length) * 100)
                : 0,
            memberCount: inputData.members.length,
        };
    }
    async getTeamMeetingNotes(projectId, reportDate) {
        const meetings = await this.meetingsRepository.findByProject(projectId, {
            fromDate: reportDate,
            toDate: reportDate,
            page: 1,
            limit: 20,
        });
        if (!meetings.items.length)
            return [];
        const summaries = this.meetingSummaryModel
            ? await this.meetingSummaryModel
                .find({
                projectId,
                meetingId: { $in: meetings.items.map((meeting) => meeting.id) },
            })
                .sort({ createdAt: -1 })
                .exec()
            : [];
        const summaryByMeeting = new Map(summaries.map((summary) => [summary.meetingId, summary]));
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
            };
        });
    }
    async getPreviousTeamReport(workspaceId, projectId, reportDate) {
        if (!this.aiReportModel)
            return null;
        const previousReport = await this.aiReportModel
            .findOne({
            workspaceId,
            projectId,
            reportType: ai_report_type_enum_1.AiReportType.TeamDailyReport,
            reportDate: { $lt: reportDate },
        })
            .sort({ reportDate: -1, createdAt: -1 })
            .exec();
        if (!previousReport)
            return null;
        const output = previousReport.aiOutput;
        return {
            reportDate: previousReport.reportDate,
            summary: output?.summary ?? null,
            todayFocus: output?.todayFocus ?? [],
            blockers: output?.blockers ?? [],
        };
    }
    async getTeamHandovers(projectId, reportDate) {
        const handovers = await this.shiftHandoversRepository.findByProjectAndDate(projectId, reportDate);
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
    getHandoverStats(handovers) {
        const countByStatus = (status) => handovers.filter((handover) => handover.status === status).length;
        return {
            total: handovers.length,
            acknowledged: countByStatus(handover_status_enum_1.HandoverStatus.Acknowledged),
            pending: countByStatus(handover_status_enum_1.HandoverStatus.Pending),
            changesRequested: countByStatus(handover_status_enum_1.HandoverStatus.ChangesRequested),
            rejected: countByStatus(handover_status_enum_1.HandoverStatus.Rejected),
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
            workflowStatusId: task.workflowStatusId,
            workflowStatusKey: task.workflowStatusKey ?? task.status,
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
    __param(8, (0, common_1.Optional)()),
    __param(8, (0, mongoose_1.InjectModel)(meeting_summary_schema_1.MeetingSummary.name)),
    __param(9, (0, common_1.Optional)()),
    __param(9, (0, mongoose_1.InjectModel)(ai_report_schema_1.AiReport.name)),
    __metadata("design:paramtypes", [daily_updates_repository_1.DailyUpdatesRepository,
        project_access_service_1.ProjectAccessService,
        sprint_access_service_1.SprintAccessService,
        tasks_repository_1.TasksRepository,
        workspace_access_service_1.WorkspaceAccessService,
        workspace_members_repository_1.WorkspaceMembersRepository,
        shift_handovers_repository_1.ShiftHandoversRepository,
        meetings_repository_1.MeetingsRepository, Object, Object])
], AiTeamReportDataBuilderService);
//# sourceMappingURL=ai-team-report-data-builder.service.js.map