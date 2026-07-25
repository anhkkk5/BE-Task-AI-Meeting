import { OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import Redis from 'ioredis';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingsService } from '../services/meetings.service';
export type MeetingAutoCompleteRunResult = {
    candidates: number;
    completed: number;
    failed: number;
    lockAcquired: boolean;
};
export declare class MeetingAutoCompleteSchedulerService implements OnApplicationBootstrap {
    private readonly configService;
    private readonly schedulerRegistry;
    private readonly redis;
    private readonly meetingsRepository;
    private readonly meetingsService;
    private readonly logger;
    private readonly jobName;
    constructor(configService: ConfigService, schedulerRegistry: SchedulerRegistry, redis: Redis, meetingsRepository: MeetingsRepository, meetingsService: MeetingsService);
    onApplicationBootstrap(): void;
    runScheduledAutoComplete(now?: Date): Promise<MeetingAutoCompleteRunResult>;
    private releaseLock;
    private getGraceMinutes;
    private getLockTtlSeconds;
    private getTimeZone;
    private getBoolean;
}
