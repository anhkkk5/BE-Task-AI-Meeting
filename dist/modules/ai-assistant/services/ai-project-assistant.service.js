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
exports.AiProjectAssistantService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const daily_mood_enum_1 = require("../../../common/enums/daily-mood.enum");
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const daily_updates_repository_1 = require("../../daily-updates/repositories/daily-updates.repository");
const projects_repository_1 = require("../../projects/repositories/projects.repository");
const project_access_service_1 = require("../../projects/services/project-access.service");
const sprints_repository_1 = require("../../sprints/repositories/sprints.repository");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const ai_provider_service_1 = require("./ai-provider.service");
const project_assistant_message_schema_1 = require("../schemas/project-assistant-message.schema");
let AiProjectAssistantService = class AiProjectAssistantService {
    aiProviderService;
    dailyUpdatesRepository;
    projectAccessService;
    projectsRepository;
    sprintAccessService;
    sprintsRepository;
    tasksRepository;
    workspaceAccessService;
    messageModel;
    constructor(aiProviderService, dailyUpdatesRepository, projectAccessService, projectsRepository, sprintAccessService, sprintsRepository, tasksRepository, workspaceAccessService, messageModel) {
        this.aiProviderService = aiProviderService;
        this.dailyUpdatesRepository = dailyUpdatesRepository;
        this.projectAccessService = projectAccessService;
        this.projectsRepository = projectsRepository;
        this.sprintAccessService = sprintAccessService;
        this.sprintsRepository = sprintsRepository;
        this.tasksRepository = tasksRepository;
        this.workspaceAccessService = workspaceAccessService;
        this.messageModel = messageModel;
    }
    async ask(userId, workspaceId, projectId, dto) {
        await this.assertAccess(userId, workspaceId, projectId);
        const project = await this.projectsRepository.findByIdAndWorkspace(projectId, workspaceId);
        const sprint = dto.sprintId
            ? await this.sprintAccessService.assertSprintInProject(dto.sprintId, projectId)
            : await this.findDefaultSprint(projectId);
        const tasks = sprint
            ? await this.tasksRepository.findBySprint(projectId, sprint.id)
            : (await this.tasksRepository.findByProject(projectId, {
                page: 1,
                limit: 100,
            })).items;
        const updates = (await this.dailyUpdatesRepository.findTeam(projectId, {
            ...(sprint ? { sprintId: sprint.id } : {}),
            page: 1,
            limit: 100,
        })).items;
        const risk = sprint
            ? this.buildRiskAssessment(sprint, tasks, updates)
            : undefined;
        const fallback = this.buildFallbackAnswer(dto.question, project, sprint, tasks, updates, risk);
        const sources = this.buildSources(project, sprint, tasks, updates, dto.question);
        const actionDraft = this.buildActionDraft(dto.question, sprint, tasks);
        let output = fallback;
        try {
            output = (await this.aiProviderService.generateProjectAssistantAnswer(this.buildPrompt(dto.question, project, sprint, tasks, updates, risk), fallback)).output;
        }
        catch {
            output = fallback;
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
    async getHistory(userId, workspaceId, projectId) {
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
                items: items.map((item) => ({
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
    async clearHistory(userId, workspaceId, projectId) {
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
    async getSprintRisk(userId, workspaceId, projectId, sprintId) {
        await this.assertAccess(userId, workspaceId, projectId);
        const sprint = await this.sprintAccessService.assertSprintInProject(sprintId, projectId);
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
    buildRiskAssessment(sprint, sprintTasks, updates, now = new Date()) {
        const tasks = sprintTasks.filter((task) => task.status !== task_status_enum_1.TaskStatus.Cancelled);
        const remaining = tasks.filter((task) => task.status !== task_status_enum_1.TaskStatus.Done);
        const completedTasks = tasks.length - remaining.length;
        const completionRate = tasks.length
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0;
        const today = this.startOfUtcDay(now);
        const overdue = remaining.filter((task) => task.dueDate && this.toUtcDate(task.dueDate) < today);
        const unassigned = remaining.filter((task) => !task.assigneeId);
        const staleLimit = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const stale = remaining.filter((task) => task.updatedAt < staleLimit);
        const blockedUpdates = updates.filter((update) => update.mood === daily_mood_enum_1.DailyMood.Blocked || Boolean(update.blockers?.trim()));
        const blockedMembers = new Set(blockedUpdates.map((update) => update.userId)).size;
        const { elapsedPercent, remainingDays } = this.calculateSchedule(sprint, today);
        const progressGap = Math.max(0, elapsedPercent - completionRate);
        const signals = [];
        let score = 0;
        if (progressGap > 50)
            score += 30;
        else if (progressGap > 25)
            score += 20;
        else if (progressGap > 10)
            score += 10;
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
            score += Math.min(25, 10 + Math.round((overdue.length / Math.max(1, remaining.length)) * 15));
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
                    .map((update) => `${update.user?.fullName ?? update.userId}: ${update.blockers ?? 'Đang bị chặn'}`)
                    .join('; '),
                taskIds: [],
            });
        }
        if (unassigned.length) {
            score += Math.min(15, Math.round((unassigned.length / Math.max(1, remaining.length)) * 15));
            signals.push({
                code: 'UNASSIGNED_TASKS',
                severity: unassigned.length === remaining.length ? 'DANGER' : 'WARNING',
                title: `${unassigned.length} công việc chưa có người phụ trách`,
                detail: 'Cần phân công rõ người chịu trách nhiệm trước khi Sprint tiến sâu hơn.',
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
        if (sprint.status === sprint_status_enum_1.SprintStatus.Active &&
            remainingDays < 0 &&
            remaining.length) {
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
            summary: signals.length === 0
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
                workloadHoursRemaining: remaining.reduce((sum, task) => sum + (task.estimatedHours ?? 0), 0),
                storyPointsRemaining: remaining.reduce((sum, task) => sum + (task.storyPoints ?? 0), 0),
            },
            signals,
            recommendations,
            generatedAt: now.toISOString(),
        };
    }
    buildActionDraft(question, sprint, tasks = []) {
        const normalized = question.trim();
        const referencedTask = tasks.find((task) => new RegExp(`(?:^|\\s)${task.taskCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s|[,.:;-])`, 'iu').test(normalized));
        const extractedTitle = normalized
            .replace(/^.*?(?:tạo|thêm|lập)\s+(?:một\s+)?(?:task|công việc)\s*(?:mới\s*)?(?::|-)?\s*/iu, '')
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
        if (!referencedTask)
            return undefined;
        const base = {
            requiresConfirmation: true,
            taskId: referencedTask.id,
            taskLabel: `${referencedTask.taskCode} - ${referencedTask.title}`,
        };
        if (/\b(?:đổi|chuyển|cập nhật)\s+(?:trạng thái|status)/iu.test(normalized)) {
            const status = /hoàn thành|done/iu.test(normalized)
                ? task_status_enum_1.TaskStatus.Done
                : /đang (?:làm|xử lý)|in[_ ]?progress/iu.test(normalized)
                    ? task_status_enum_1.TaskStatus.InProgress
                    : /review|kiểm thử|duyệt/iu.test(normalized)
                        ? task_status_enum_1.TaskStatus.Review
                        : /backlog/iu.test(normalized)
                            ? task_status_enum_1.TaskStatus.Backlog
                            : task_status_enum_1.TaskStatus.Todo;
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
        if (/\b(?:sửa|cập nhật|đổi)\s+(?:task|công việc|tiêu đề|mô tả)/iu.test(normalized)) {
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
    async assertAccess(userId, workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
    }
    async findDefaultSprint(projectId) {
        const active = await this.sprintsRepository.findActiveByProject(projectId);
        if (active)
            return active;
        const result = await this.sprintsRepository.findByProject(projectId, {
            page: 1,
            limit: 100,
        });
        return (result.items.find((sprint) => sprint.status === sprint_status_enum_1.SprintStatus.Planned) ??
            result.items.find((sprint) => sprint.status !== sprint_status_enum_1.SprintStatus.Cancelled) ??
            null);
    }
    buildFallbackAnswer(question, project, sprint, tasks, updates, risk) {
        const normalized = question.toLocaleLowerCase('vi');
        const openTasks = tasks.filter((task) => ![task_status_enum_1.TaskStatus.Done, task_status_enum_1.TaskStatus.Cancelled].includes(task.status));
        const overdue = openTasks.filter((task) => task.dueDate &&
            this.toUtcDate(task.dueDate) < this.startOfUtcDay(new Date()));
        const blockers = updates.filter((update) => update.blockers?.trim());
        let answer = `Dự án ${project?.name ?? ''} có ${tasks.length} công việc trong phạm vi đang xem, ${openTasks.length} công việc chưa hoàn thành.`;
        if ((normalized.includes('rủi ro') || normalized.includes('risk')) &&
            risk) {
            answer = `${risk.levelLabel}: ${risk.score}/100. ${risk.summary}`;
        }
        else if (normalized.includes('quá hạn')) {
            answer = overdue.length
                ? `Có ${overdue.length} công việc quá hạn: ${overdue.map((task) => `${task.taskCode} - ${task.title}`).join('; ')}.`
                : 'Không có công việc quá hạn trong phạm vi đang xem.';
        }
        else if (normalized.includes('blocker') ||
            normalized.includes('trở ngại')) {
            answer = blockers.length
                ? `Có ${blockers.length} cập nhật chứa trở ngại: ${blockers.map((item) => `${item.user?.fullName ?? item.userId}: ${item.blockers}`).join('; ')}.`
                : 'Chưa có thành viên báo trở ngại trong phạm vi đang xem.';
        }
        else if (normalized.includes('chưa gán') ||
            normalized.includes('chưa giao')) {
            const unassigned = openTasks.filter((task) => !task.assigneeId);
            answer = unassigned.length
                ? `Có ${unassigned.length} công việc chưa có người phụ trách: ${unassigned.map((task) => task.taskCode).join(', ')}.`
                : 'Tất cả công việc đang mở đều đã có người phụ trách.';
        }
        else if (normalized.includes('tiến độ') ||
            normalized.includes('hoàn thành')) {
            const done = tasks.filter((task) => task.status === task_status_enum_1.TaskStatus.Done).length;
            const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            answer = `${sprint?.name ?? project?.name ?? 'Phạm vi hiện tại'} đã hoàn thành ${done}/${tasks.length} công việc, tương đương ${rate}%.`;
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
    buildSources(project, sprint, tasks, updates, question) {
        const sources = [];
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
        if (wantsBlockers) {
            sources.push(...updates
                .filter((update) => update.blockers?.trim())
                .slice(0, 5)
                .map((update) => ({
                type: 'DAILY_UPDATE',
                id: update.id,
                label: update.user?.fullName ?? update.userId,
                detail: update.blockers ?? '',
            })));
        }
        else {
            sources.push(...tasks.slice(0, 5).map((task) => ({
                type: 'TASK',
                id: task.id,
                label: `${task.taskCode} - ${task.title}`,
                detail: task.status,
            })));
        }
        return sources;
    }
    buildPrompt(question, project, sprint, tasks, updates, risk) {
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
            risk,
        });
    }
    calculateSchedule(sprint, today) {
        const start = this.toUtcDate(sprint.startDate);
        const end = this.toUtcDate(sprint.endDate);
        const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
        const elapsedDays = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
        const elapsedPercent = sprint.status === sprint_status_enum_1.SprintStatus.Completed
            ? 100
            : sprint.status === sprint_status_enum_1.SprintStatus.Planned
                ? 0
                : Math.max(0, Math.min(100, Math.round((elapsedDays / duration) * 100)));
        const remainingDays = Math.round((end.getTime() - today.getTime()) / 86400000);
        return { elapsedPercent, remainingDays };
    }
    resolveRiskLevel(score) {
        if (score >= 75)
            return { level: 'CRITICAL', label: 'Rủi ro nghiêm trọng' };
        if (score >= 50)
            return { level: 'HIGH', label: 'Rủi ro cao' };
        if (score >= 25)
            return { level: 'MEDIUM', label: 'Rủi ro trung bình' };
        return { level: 'LOW', label: 'Rủi ro thấp' };
    }
    buildRecommendations(signals) {
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
    toUtcDate(value) {
        return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
    }
    startOfUtcDay(value) {
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }
};
exports.AiProjectAssistantService = AiProjectAssistantService;
exports.AiProjectAssistantService = AiProjectAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __param(8, (0, common_1.Optional)()),
    __param(8, (0, mongoose_1.InjectModel)(project_assistant_message_schema_1.ProjectAssistantMessage.name)),
    __metadata("design:paramtypes", [ai_provider_service_1.AiProviderService,
        daily_updates_repository_1.DailyUpdatesRepository,
        project_access_service_1.ProjectAccessService,
        projects_repository_1.ProjectsRepository,
        sprint_access_service_1.SprintAccessService,
        sprints_repository_1.SprintsRepository,
        tasks_repository_1.TasksRepository,
        workspace_access_service_1.WorkspaceAccessService,
        mongoose_2.Model])
], AiProjectAssistantService);
//# sourceMappingURL=ai-project-assistant.service.js.map