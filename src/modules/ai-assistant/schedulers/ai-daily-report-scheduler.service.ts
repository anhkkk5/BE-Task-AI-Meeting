import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { REDIS_CLIENT } from '../../../database/redis/redis.constants';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { UserStatus } from '../../users/enums/user-status.enum';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
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

/** Ket qua lan chay gan nhat, duoc giu lai de UI biet may da tu dong chay. */
export type LastAutomaticRun = AutomaticReportRunResult & {
  finishedAt: string;
};

export type ReportAutomationStatus = {
  enabled: boolean;
  cron: string;
  timeZone: string;
  includeTeam: boolean;
  nextRunAt: string | null;
  lastRun: LastAutomaticRun | null;
};

@Injectable()
export class AiDailyReportSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AiDailyReportSchedulerService.name);
  private readonly jobName = 'automatic-ai-daily-reports';
  private readonly lastRunKey = 'ai-daily-reports:last-run';

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly projectsRepository: ProjectsRepository,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly _personalReportService: AiPersonalReportService,
    private readonly teamReportService: AiTeamReportService,
  ) {}

  onApplicationBootstrap() {
    if (!this.getBoolean('AI_DAILY_REPORT_SCHEDULER_ENABLED', false)) {
      this.logger.log('Lich tao bao cao giao ban tu dong dang tat');
      return;
    }

    if (!this.getBoolean('MONGODB_ENABLED', false)) {
      this.logger.warn(
        'Khong khoi dong lich bao cao giao ban vi MongoDB dang tat',
      );
      return;
    }

    const cronTime = this.configService.get<string>(
      'AI_DAILY_REPORT_CRON',
      '0 0 17 * * 1-5',
    );
    const timeZone = this.getTimeZone();

    try {
      const job = CronJob.from({
        cronTime,
        timeZone,
        start: false,
        waitForCompletion: true,
        onTick: () => void this.runScheduledReports(),
        errorHandler: (error) =>
          this.logger.error('Lich tao bao cao giao ban gap loi', error),
      });

      this.schedulerRegistry.addCronJob(this.jobName, job);
      job.start();
      this.logger.log(
        `Da bat lich tao bao cao giao ban: ${cronTime} (${timeZone})`,
      );
    } catch (error) {
      this.logger.error(
        `Khong the khoi dong lich bao cao voi cron "${cronTime}"`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async runScheduledReports(
    now = new Date(),
  ): Promise<AutomaticReportRunResult> {
    const reportDate = this.formatDateInTimeZone(now, this.getTimeZone());
    const result: AutomaticReportRunResult = {
      reportDate,
      projects: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
      lockAcquired: false,
    };
    const lockKey = `locks:ai-daily-reports:${reportDate}`;
    const lockToken = randomUUID();

    try {
      const lock = await this.redis.set(
        lockKey,
        lockToken,
        'EX',
        this.getLockTtlSeconds(),
        'NX',
      );

      if (lock !== 'OK') {
        this.logger.log(`Bao cao giao ban ngay ${reportDate} dang duoc xu ly`);
        return result;
      }

      result.lockAcquired = true;
      const projects =
        await this.projectsRepository.findActiveForAutomaticReports(reportDate);
      result.projects = projects.length;

      for (const project of projects) {
        const members =
          await this.workspaceMembersRepository.findActiveByWorkspace(
            project.workspaceId,
          );
        const activeMembers = members.filter(
          (member) =>
            member.role !== WorkspaceRole.Viewer &&
            member.user?.status === UserStatus.Active,
        );
        const manager = this.findReportManager(activeMembers);

        if (!manager) {
          result.skipped +=
            activeMembers.length +
            (this.getBoolean('AI_DAILY_REPORT_INCLUDE_TEAM', true) ? 1 : 0);
          this.logger.warn(
            `Bo qua project ${project.id}: khong co nguoi quan ly hop le`,
          );
          continue;
        }

        if (this.getBoolean('AI_DAILY_REPORT_INCLUDE_TEAM', true)) {
          try {
            const generated =
              await this.teamReportService.generateScheduledTeamDailyReport(
                manager.userId,
                project.workspaceId,
                project.id,
                reportDate,
              );
            result[generated.generated ? 'generated' : 'skipped'] += 1;
          } catch (error) {
            result.failed += 1;
            this.logger.error(
              `Khong the tao bao cao nhom tai project ${project.id}`,
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      }

      this.logger.log(
        `Da xu ly bao cao giao ban ${reportDate}: tao ${result.generated}, bo qua ${result.skipped}, loi ${result.failed}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Khong the chay lich bao cao giao ban ngay ${reportDate}`,
        error instanceof Error ? error.stack : String(error),
      );
      result.failed += 1;
      return result;
    } finally {
      if (result.lockAcquired) {
        // Chi ghi lai khi that su la lan chay cua may nay, tranh ghi de
        // ket qua cua instance khac dang giu khoa.
        await this.saveLastRun(result);
        await this.releaseLock(lockKey, lockToken);
      }
    }
  }

  /**
   * Tra ve trang thai lich tu dong cho frontend.
   *
   * Muc dich: nguoi dung phai thay duoc bao cao la do may tu tao theo lich,
   * neu khong ho se tuong tinh nang chua chay va di bam tao thu cong.
   */
  async getAutomationStatus(): Promise<ReportAutomationStatus> {
    return {
      enabled: this.getBoolean('AI_DAILY_REPORT_SCHEDULER_ENABLED', false),
      cron: this.configService.get<string>(
        'AI_DAILY_REPORT_CRON',
        '0 0 17 * * 1-5',
      ),
      timeZone: this.getTimeZone(),
      includeTeam: this.getBoolean('AI_DAILY_REPORT_INCLUDE_TEAM', true),
      nextRunAt: this.resolveNextRunAt(),
      lastRun: await this.getLastRun(),
    };
  }

  private resolveNextRunAt() {
    try {
      const job = this.schedulerRegistry.getCronJob(this.jobName);
      // Tuy phien ban cron, nextDate() tra ve luxon DateTime hoac Date.
      const next = job.nextDate() as unknown as {
        toJSDate?: () => Date;
        toMillis?: () => number;
      };

      if (typeof next?.toJSDate === 'function') {
        return next.toJSDate().toISOString();
      }

      if (typeof next?.toMillis === 'function') {
        return new Date(next.toMillis()).toISOString();
      }

      return null;
    } catch {
      // Job chua duoc dang ky, vi du khi lich dang tat.
      return null;
    }
  }

  private async saveLastRun(result: AutomaticReportRunResult) {
    const payload: LastAutomaticRun = {
      ...result,
      finishedAt: new Date().toISOString(),
    };

    try {
      await this.redis.set(this.lastRunKey, JSON.stringify(payload));
    } catch (error) {
      // Khong lam that bai ca lan chay chi vi khong ghi duoc trang thai.
      this.logger.warn(
        `Khong the luu trang thai lan chay gan nhat: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async getLastRun(): Promise<LastAutomaticRun | null> {
    try {
      const raw = await this.redis.get(this.lastRunKey);

      return raw ? (JSON.parse(raw) as LastAutomaticRun) : null;
    } catch {
      return null;
    }
  }

  private findReportManager(members: WorkspaceMember[]) {
    const roleOrder = [
      WorkspaceRole.Owner,
      WorkspaceRole.ScrumMaster,
      WorkspaceRole.ProjectManager,
    ];

    for (const role of roleOrder) {
      const member = members.find((item) => item.role === role);

      if (member) {
        return member;
      }
    }

    return null;
  }

  private async releaseLock(lockKey: string, lockToken: string) {
    try {
      await this.redis.eval(
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
        1,
        lockKey,
        lockToken,
      );
    } catch (error) {
      this.logger.warn(
        `Khong the giai phong khoa Redis ${lockKey}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private formatDateInTimeZone(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const getPart = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? '';

    return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  }

  private getTimeZone() {
    return this.configService.get<string>(
      'AI_DAILY_REPORT_TIMEZONE',
      'Asia/Bangkok',
    );
  }

  private getLockTtlSeconds() {
    const value = Number(
      this.configService.get<string>(
        'AI_DAILY_REPORT_LOCK_TTL_SECONDS',
        '3600',
      ),
    );
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3600;
  }

  private getBoolean(key: string, fallback: boolean) {
    const value = this.configService.get<string | boolean>(key);

    if (value === undefined) {
      return fallback;
    }

    return (
      value === true ||
      ['true', '1', 'yes'].includes(String(value).toLowerCase())
    );
  }
}
