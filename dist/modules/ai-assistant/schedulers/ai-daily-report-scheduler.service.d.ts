import { OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import Redis from 'ioredis';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { AiPersonalReportService } from '../services/ai-personal-report.service';
import { AiTeamReportService } from '../services/ai-team-report.service';
export type AutomaticReportRunResult = {
    reportDate: string;
    projects: number;
    generated: number;
    skipped: number;
    failed: number;
    lockAcquired: boolean;
};
export declare class AiDailyReportSchedulerService implements OnApplicationBootstrap {
    private readonly configService;
    private readonly schedulerRegistry;
    private readonly redis;
    private readonly projectsRepository;
    private readonly workspaceMembersRepository;
    private readonly personalReportService;
    private readonly teamReportService;
    private readonly logger;
    private readonly jobName;
    constructor(configService: ConfigService, schedulerRegistry: SchedulerRegistry, redis: Redis, projectsRepository: ProjectsRepository, workspaceMembersRepository: WorkspaceMembersRepository, personalReportService: AiPersonalReportService, teamReportService: AiTeamReportService);
    onApplicationBootstrap(): void;
    runScheduledReports(now?: Date): Promise<AutomaticReportRunResult>;
    private findReportManager;
    private releaseLock;
    private formatDateInTimeZone;
    private getTimeZone;
    private getLockTtlSeconds;
    private getBoolean;
}
