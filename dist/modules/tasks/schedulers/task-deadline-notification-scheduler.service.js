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
var TaskDeadlineNotificationSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDeadlineNotificationSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const notifications_service_1 = require("../../notifications/notifications.service");
const tasks_repository_1 = require("../repositories/tasks.repository");
let TaskDeadlineNotificationSchedulerService = TaskDeadlineNotificationSchedulerService_1 = class TaskDeadlineNotificationSchedulerService {
    configService;
    schedulerRegistry;
    tasksRepository;
    notificationsService;
    logger = new common_1.Logger(TaskDeadlineNotificationSchedulerService_1.name);
    jobName = 'task-deadline-notifications';
    constructor(configService, schedulerRegistry, tasksRepository, notificationsService) {
        this.configService = configService;
        this.schedulerRegistry = schedulerRegistry;
        this.tasksRepository = tasksRepository;
        this.notificationsService = notificationsService;
    }
    onApplicationBootstrap() {
        if (!this.enabled())
            return;
        const cronTime = this.configService.get('TASK_DEADLINE_NOTIFICATION_CRON', '0 0 * * * *');
        const timeZone = this.configService.get('AI_DAILY_REPORT_TIMEZONE', 'Asia/Bangkok');
        const job = cron_1.CronJob.from({
            cronTime,
            timeZone,
            start: false,
            waitForCompletion: true,
            onTick: () => void this.run(),
            errorHandler: (error) => this.logger.error('Task deadline scheduler failed', error),
        });
        this.schedulerRegistry.addCronJob(this.jobName, job);
        job.start();
    }
    async run(now = new Date()) {
        const today = this.formatDate(now);
        const tomorrowDate = new Date(now);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrow = this.formatDate(tomorrowDate);
        const tasks = await this.tasksRepository.findDueNotificationCandidates(tomorrow);
        let sent = 0;
        for (const task of tasks) {
            if (!task.assigneeId || !task.dueDate)
                continue;
            const overdue = task.dueDate < today;
            const type = overdue
                ? notification_entity_1.NotificationType.TaskOverdue
                : notification_entity_1.NotificationType.TaskDueSoon;
            await this.notificationsService.create({
                recipientId: task.assigneeId,
                type,
                title: overdue ? 'Công việc đã quá hạn' : 'Công việc sắp đến hạn',
                body: `${task.taskCode} · ${task.title} · Hạn ${task.dueDate}`,
                link: `/workspaces/${task.project.workspaceId}/projects/${task.projectId}/tasks/${task.id}`,
                metadata: {
                    taskId: task.id,
                    projectId: task.projectId,
                    workspaceId: task.project.workspaceId,
                    dueDate: task.dueDate,
                },
                idempotencyKey: `${type}:${task.id}:${task.dueDate}`,
            });
            sent += 1;
        }
        return { candidates: tasks.length, sent };
    }
    enabled() {
        const value = this.configService.get('TASK_DEADLINE_NOTIFICATION_ENABLED');
        return (value === undefined ||
            value === true ||
            ['true', '1', 'yes'].includes(String(value).toLowerCase()));
    }
    formatDate(date) {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: this.configService.get('AI_DAILY_REPORT_TIMEZONE', 'Asia/Bangkok'),
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        const parts = formatter.formatToParts(date);
        const part = (type) => parts.find((item) => item.type === type)?.value ?? '';
        return `${part('year')}-${part('month')}-${part('day')}`;
    }
};
exports.TaskDeadlineNotificationSchedulerService = TaskDeadlineNotificationSchedulerService;
exports.TaskDeadlineNotificationSchedulerService = TaskDeadlineNotificationSchedulerService = TaskDeadlineNotificationSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        schedule_1.SchedulerRegistry,
        tasks_repository_1.TasksRepository,
        notifications_service_1.NotificationsService])
], TaskDeadlineNotificationSchedulerService);
//# sourceMappingURL=task-deadline-notification-scheduler.service.js.map