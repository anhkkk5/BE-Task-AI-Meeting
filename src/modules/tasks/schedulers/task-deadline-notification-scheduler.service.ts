import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { TasksRepository } from '../repositories/tasks.repository';

@Injectable()
export class TaskDeadlineNotificationSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TaskDeadlineNotificationSchedulerService.name);
  private readonly jobName = 'task-deadline-notifications';

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly tasksRepository: TasksRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  onApplicationBootstrap() {
    if (!this.enabled()) return;
    const cronTime = this.configService.get<string>('TASK_DEADLINE_NOTIFICATION_CRON', '0 0 * * * *');
    const timeZone = this.configService.get<string>('AI_DAILY_REPORT_TIMEZONE', 'Asia/Bangkok');
    const job = CronJob.from({ cronTime, timeZone, start: false, waitForCompletion: true, onTick: () => void this.run(), errorHandler: (error) => this.logger.error('Task deadline scheduler failed', error) });
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
      if (!task.assigneeId || !task.dueDate) continue;
      const overdue = task.dueDate < today;
      const type = overdue ? NotificationType.TaskOverdue : NotificationType.TaskDueSoon;
      await this.notificationsService.create({
        recipientId: task.assigneeId,
        type,
        title: overdue ? 'Công việc đã quá hạn' : 'Công việc sắp đến hạn',
        body: `${task.taskCode} · ${task.title} · Hạn ${task.dueDate}`,
        link: `/workspaces/${task.project.workspaceId}/projects/${task.projectId}/tasks/${task.id}`,
        metadata: { taskId: task.id, projectId: task.projectId, workspaceId: task.project.workspaceId, dueDate: task.dueDate },
        idempotencyKey: `${type}:${task.id}:${task.dueDate}`,
      });
      sent += 1;
    }
    return { candidates: tasks.length, sent };
  }

  private enabled() {
    const value = this.configService.get<string | boolean>('TASK_DEADLINE_NOTIFICATION_ENABLED');
    return value === undefined || value === true || ['true', '1', 'yes'].includes(String(value).toLowerCase());
  }

  private formatDate(date: Date) {
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: this.configService.get<string>('AI_DAILY_REPORT_TIMEZONE', 'Asia/Bangkok'), year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = formatter.formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
}
