import { OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationsService } from '../../notifications/notifications.service';
import { TasksRepository } from '../repositories/tasks.repository';
export declare class TaskDeadlineNotificationSchedulerService implements OnApplicationBootstrap {
    private readonly configService;
    private readonly schedulerRegistry;
    private readonly tasksRepository;
    private readonly notificationsService;
    private readonly logger;
    private readonly jobName;
    constructor(configService: ConfigService, schedulerRegistry: SchedulerRegistry, tasksRepository: TasksRepository, notificationsService: NotificationsService);
    onApplicationBootstrap(): void;
    run(now?: Date): Promise<{
        candidates: number;
        sent: number;
    }>;
    private enabled;
    private formatDate;
}
