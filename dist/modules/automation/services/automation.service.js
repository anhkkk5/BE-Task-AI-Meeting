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
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const notifications_service_1 = require("../../notifications/notifications.service");
const project_access_service_1 = require("../../projects/services/project-access.service");
const tasks_repository_1 = require("../../tasks/repositories/tasks.repository");
const tasks_service_1 = require("../../tasks/services/tasks.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const automation_repository_1 = require("../repositories/automation.repository");
let AutomationService = class AutomationService {
    repo;
    tasksRepo;
    tasks;
    notifications;
    projects;
    workspaces;
    constructor(repo, tasksRepo, tasks, notifications, projects, workspaces) {
        this.repo = repo;
        this.tasksRepo = tasksRepo;
        this.tasks = tasks;
        this.notifications = notifications;
        this.projects = projects;
        this.workspaces = workspaces;
    }
    async list(userId, workspaceId, projectId) { await this.access(userId, workspaceId, projectId); return { success: true, message: 'Success', data: { items: await this.repo.listRules(projectId) } }; }
    async save(userId, workspaceId, projectId, dto, id) { await this.access(userId, workspaceId, projectId); this.validate(dto); const current = id ? await this.requireRule(id, projectId) : null; const changed = !current || JSON.stringify([current.trigger, current.conditions, current.actions]) !== JSON.stringify([dto.trigger, dto.conditions, dto.actions]); const dryRunAt = changed ? null : current.dryRunAt; const enabled = dto.enabled ?? current?.enabled ?? false; if (enabled && !dryRunAt)
        throw new common_1.BadRequestException('Run a dry-run before enabling this rule'); const rule = await this.repo.saveRule({ ...current, workspaceId, projectId, name: dto.name.trim(), enabled, trigger: dto.trigger, conditions: dto.conditions, actions: dto.actions, dryRunAt, createdBy: current?.createdBy ?? userId }); return { success: true, message: 'Automation rule saved', data: { rule } }; }
    async remove(userId, workspaceId, projectId, id) { await this.access(userId, workspaceId, projectId); await this.repo.deleteRule(await this.requireRule(id, projectId)); return { success: true, message: 'Deleted', data: null }; }
    async preview(userId, workspaceId, projectId, id) { await this.access(userId, workspaceId, projectId); const rule = await this.requireRule(id, projectId); const matches = await this.matches(rule); rule.dryRunAt = new Date(); await this.repo.saveRule(rule); await this.repo.saveRun({ ruleId: rule.id, taskId: null, executionKey: `dry:${rule.id}:${Date.now()}`, status: 'DRY_RUN', result: { count: matches.length, taskIds: matches.map((task) => task.id), actions: rule.actions }, error: null, retryCount: 0 }); return { success: true, message: 'Dry run completed', data: { matchedTasks: matches.map((task) => ({ id: task.id, taskCode: task.taskCode, title: task.title })), plannedActions: rule.actions, count: matches.length } }; }
    async history(userId, workspaceId, projectId, id) { await this.access(userId, workspaceId, projectId); await this.requireRule(id, projectId); return { success: true, message: 'Success', data: { items: await this.repo.listRuns(id) } }; }
    async runRule(rule, forceRetry = 0) { const matches = await this.matches(rule); const results = []; for (const task of matches)
        results.push(await this.execute(rule, task, forceRetry)); return results; }
    async retry(userId, workspaceId, projectId, runId) { await this.access(userId, workspaceId, projectId); const previous = await this.repo.findRun(runId); if (!previous || previous.status !== 'FAILED')
        throw new common_1.BadRequestException('Only failed runs can be retried'); const rule = await this.requireRule(previous.ruleId, projectId); const task = previous.taskId ? await this.tasksRepo.findByIdAndProject(previous.taskId, projectId) : null; if (!task)
        throw new common_1.NotFoundException('Task not found'); return { success: true, message: 'Retry completed', data: { run: await this.execute(rule, task, previous.retryCount + 1) } }; }
    async execute(rule, task, retry) { const day = new Date().toISOString().slice(0, 10); const key = `${rule.id}:${task.id}:${day}:r${retry}`; if (await this.repo.findExecution(key))
        return this.repo.saveRun({ ruleId: rule.id, taskId: task.id, executionKey: `${key}:skip:${Date.now()}`, status: 'SKIPPED', result: { reason: 'DUPLICATE' }, error: null, retryCount: retry }); try {
        const output = [];
        for (const action of rule.actions) {
            if (action.type === 'NOTIFY_ASSIGNEE' && task.assigneeId) {
                await this.notifications.create({ recipientId: task.assigneeId, type: notification_entity_1.NotificationType.TaskDueSoon, title: 'Nhắc việc tự động', body: action.message || `${task.taskCode} - ${task.title} sắp đến hạn`, link: `/workspaces/${rule.workspaceId}/projects/${rule.projectId}/tasks/${task.id}`, idempotencyKey: key });
                output.push(action.type);
            }
            else if (action.type === 'CHANGE_STATUS' && action.value) {
                await this.tasks.updateTaskStatus(rule.createdBy, rule.workspaceId, rule.projectId, task.id, { status: action.value });
                output.push(action.type);
            }
            else if (action.type === 'ASSIGN_USER' && action.value) {
                await this.tasks.assignTask(rule.createdBy, rule.workspaceId, rule.projectId, task.id, { assigneeId: action.value });
                output.push(action.type);
            }
        }
        return await this.repo.saveRun({ ruleId: rule.id, taskId: task.id, executionKey: key, status: 'SUCCESS', result: { actions: output }, error: null, retryCount: retry });
    }
    catch (error) {
        return this.repo.saveRun({ ruleId: rule.id, taskId: task.id, executionKey: key, status: 'FAILED', result: null, error: error instanceof Error ? error.message : String(error), retryCount: retry });
    } }
    async matches(rule) { const date = new Date(Date.now() + Math.max(0, Number(rule.trigger.daysBefore ?? 0)) * 86400000).toISOString().slice(0, 10); const candidates = await this.tasksRepo.findDueNotificationCandidates(date); return candidates.filter((task) => task.projectId === rule.projectId && rule.conditions.every((condition) => { const value = task[condition.field]; if (condition.operator === 'EQUALS')
        return value === condition.value; if (condition.operator === 'NOT_EQUALS')
        return value !== condition.value; if (condition.operator === 'IS_EMPTY')
        return value == null || value === ''; return true; })); }
    validate(dto) { if (dto.trigger.type !== 'DUE_DATE')
        throw new common_1.BadRequestException('Only DUE_DATE trigger is supported'); if (!dto.actions.length || dto.actions.length > 5)
        throw new common_1.BadRequestException('Rule must contain 1-5 actions'); const allowed = ['NOTIFY_ASSIGNEE', 'CHANGE_STATUS', 'ASSIGN_USER']; if (dto.actions.some((action) => !allowed.includes(action.type)))
        throw new common_1.BadRequestException('Unsupported action'); }
    async requireRule(id, projectId) { const rule = await this.repo.findRule(id, projectId); if (!rule)
        throw new common_1.NotFoundException('Automation rule not found'); return rule; }
    async access(userId, workspaceId, projectId) { await this.workspaces.assertWorkspaceMember(userId, workspaceId); await this.projects.assertProjectInWorkspace(projectId, workspaceId); }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [automation_repository_1.AutomationRepository, tasks_repository_1.TasksRepository, tasks_service_1.TasksService, notifications_service_1.NotificationsService, project_access_service_1.ProjectAccessService, workspace_access_service_1.WorkspaceAccessService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map