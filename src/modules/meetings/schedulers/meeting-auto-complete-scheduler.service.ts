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
import { REDIS_CLIENT } from '../../../database/redis/redis.constants';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingsService } from '../services/meetings.service';

export type MeetingAutoCompleteRunResult = {
  candidates: number;
  completed: number;
  failed: number;
  lockAcquired: boolean;
};

/**
 * Tu dong chot cac cuoc hop da qua gio ket thuc.
 *
 * Ly do ton tai: AI tom tat cuoc hop chi duoc kich hoat khi cuoc hop chuyen sang
 * COMPLETED. Voi mo hinh "ai thich vao luc nao thi vao, thich roi luc nao thi roi",
 * khong ai chiu trach nhiem bam ket thuc, nen cuoc hop se mac ket o trang thai mo
 * va AI khong bao gio chay. Scheduler nay la moc kich hoat dang tin cay.
 */
@Injectable()
export class MeetingAutoCompleteSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(
    MeetingAutoCompleteSchedulerService.name,
  );
  private readonly jobName = 'meeting-auto-complete';

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly meetingsRepository: MeetingsRepository,
    private readonly meetingsService: MeetingsService,
  ) {}

  onApplicationBootstrap() {
    if (!this.getBoolean('MEETING_AUTO_COMPLETE_ENABLED', true)) {
      this.logger.log('Lich tu dong chot cuoc hop dang tat');
      return;
    }

    const cronTime = this.configService.get<string>(
      'MEETING_AUTO_COMPLETE_CRON',
      '0 */5 * * * *',
    );
    const timeZone = this.getTimeZone();

    try {
      const job = CronJob.from({
        cronTime,
        timeZone,
        start: false,
        waitForCompletion: true,
        onTick: () => void this.runScheduledAutoComplete(),
        errorHandler: (error) =>
          this.logger.error('Lich tu dong chot cuoc hop gap loi', error),
      });

      this.schedulerRegistry.addCronJob(this.jobName, job);
      job.start();
      this.logger.log(
        `Da bat lich tu dong chot cuoc hop: ${cronTime} (${timeZone}), grace ${this.getGraceMinutes()} phut`,
      );
    } catch (error) {
      this.logger.error(
        `Khong the khoi dong lich chot cuoc hop voi cron "${cronTime}"`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async runScheduledAutoComplete(
    now = new Date(),
  ): Promise<MeetingAutoCompleteRunResult> {
    const result: MeetingAutoCompleteRunResult = {
      candidates: 0,
      completed: 0,
      failed: 0,
      lockAcquired: false,
    };
    const lockKey = 'locks:meeting-auto-complete';
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
        this.logger.debug(
          'Mot tien trinh khac dang chot cuoc hop, bo qua luot',
        );
        return result;
      }

      result.lockAcquired = true;

      // Grace period tranh cat ngang cuoc hop keo dai qua gio du kien.
      const cutoff = new Date(
        now.getTime() - this.getGraceMinutes() * 60 * 1000,
      );
      const meetings =
        await this.meetingsRepository.findDueForAutoComplete(cutoff);
      result.candidates = meetings.length;

      for (const meeting of meetings) {
        try {
          const completed =
            await this.meetingsService.autoCompleteMeeting(meeting);

          if (completed) {
            result.completed += 1;
            this.logger.log(
              `Da tu dong chot cuoc hop ${meeting.id} (${meeting.title})`,
            );
          }
        } catch (error) {
          // Mot cuoc hop loi khong duoc lam dung ca luot.
          result.failed += 1;
          this.logger.error(
            `Khong the tu dong chot cuoc hop ${meeting.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      return result;
    } finally {
      if (result.lockAcquired) {
        await this.releaseLock(lockKey, lockToken);
      }
    }
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

  private getGraceMinutes() {
    const value = Number(
      this.configService.get<string>(
        'MEETING_AUTO_COMPLETE_GRACE_MINUTES',
        '15',
      ),
    );
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 15;
  }

  /** TTL ngan hon chu ky cron de khoa khong bi ket khi tien trinh chet giua luot. */
  private getLockTtlSeconds() {
    const value = Number(
      this.configService.get<string>(
        'MEETING_AUTO_COMPLETE_LOCK_TTL_SECONDS',
        '240',
      ),
    );
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 240;
  }

  private getTimeZone() {
    return this.configService.get<string>(
      'AI_DAILY_REPORT_TIMEZONE',
      'Asia/Bangkok',
    );
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
