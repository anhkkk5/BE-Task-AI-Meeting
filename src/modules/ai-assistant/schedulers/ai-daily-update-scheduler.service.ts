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
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { SprintsRepository } from '../../sprints/repositories/sprints.repository';
import { AiUserPreferencesService } from '../../users/services/ai-user-preferences.service';
import { UserStatus } from '../../users/enums/user-status.enum';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { AiProviderService } from '../services/ai-provider.service';
import { AiReportDataBuilderService } from '../services/ai-report-data-builder.service';
import { PromptBuilderService } from '../services/prompt-builder.service';
import { DailyUpdateSubmissionStatus } from '../../../common/enums/daily-update-submission-status.enum';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { NotificationsService } from '../../notifications/notifications.service';

export type AutomaticDailyUpdateRunResult = {
  updateDate: string;
  projects: number;
  generated: number;
  skipped: number;
  failed: number;
  lockAcquired: boolean;
};

const AI_AUTO_NOTE =
  '[AI_AUTO_DAILY_UPDATE]\nBản cập nhật này được AI tự động tạo lúc 00:00 vì bạn chưa gửi Daily Update trong ngày. Vui lòng kiểm tra và chỉnh sửa nếu cần.';

/**
 * Tao Daily Update du phong cho ngay vua ket thuc.
 *
 * Job chi dien vao cho trong: ban ghi nguoi dung da tao luon duoc uu tien va
 * khong bao gio bi ghi de. Redis lock bao ve khi Render co nhieu instance,
 * con unique key cua bang daily_updates la lop bao ve cuoi cung.
 */
@Injectable()
export class AiDailyUpdateSchedulerService
  implements OnApplicationBootstrap
{
  private static readonly REVIEW_NOTE =
    '[AI_DRAFT] Bản nháp do AI tạo từ task và bàn giao. Nội dung chưa được người dùng xác nhận.';
  private readonly logger = new Logger(AiDailyUpdateSchedulerService.name);
  private readonly draftJobName = 'automatic-ai-daily-update-drafts';
  private readonly expiryJobName = 'expire-ai-daily-update-drafts';
  private readonly reminderJobName = 'remind-ai-daily-update-drafts';

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly projectsRepository: ProjectsRepository,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly sprintsRepository: SprintsRepository,
    private readonly dailyUpdatesRepository: DailyUpdatesRepository,
    private readonly dataBuilder: AiReportDataBuilderService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly aiProvider: AiProviderService,
    private readonly preferencesService: AiUserPreferencesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onApplicationBootstrap() {
    if (!this.getBoolean('AI_DAILY_UPDATE_SCHEDULER_ENABLED', false)) {
      this.logger.log('Lịch tạo Daily Update tự động đang tắt');
      return;
    }

    const cronTime = this.configService.get<string>(
      'AI_DAILY_UPDATE_CRON',
      '0 0 17 * * *',
    );
    const timeZone = this.getTimeZone();

    try {
      const job = CronJob.from({
        cronTime,
        timeZone,
        start: false,
        waitForCompletion: true,
        onTick: () => void this.runScheduledDailyUpdates(),
        errorHandler: (error) =>
          this.logger.error('Lịch tạo Daily Update gặp lỗi', error),
      });

      this.schedulerRegistry.addCronJob(this.draftJobName, job);
      job.start();
      const expiryCron = this.configService.get<string>(
        'AI_DAILY_UPDATE_EXPIRY_CRON',
        '0 59 23 * * *',
      );
      const expiryJob = CronJob.from({
        cronTime: expiryCron,
        timeZone,
        start: false,
        waitForCompletion: true,
        onTick: () => void this.expireUndeliveredDrafts(),
        errorHandler: (error) =>
          this.logger.error('Daily Update draft expiry scheduler failed', error),
      });
      this.schedulerRegistry.addCronJob(this.expiryJobName, expiryJob);
      expiryJob.start();
      const reminderCron = this.configService.get<string>(
        'AI_DAILY_UPDATE_REMINDER_CRON',
        '0 0 21 * * *',
      );
      const reminderJob = CronJob.from({
        cronTime: reminderCron,
        timeZone,
        start: false,
        waitForCompletion: true,
        onTick: () => void this.remindUndeliveredDrafts(),
        errorHandler: (error) =>
          this.logger.error('Daily Update reminder scheduler failed', error),
      });
      this.schedulerRegistry.addCronJob(this.reminderJobName, reminderJob);
      reminderJob.start();
      this.logger.log(
        `Đã bật lịch tạo Daily Update: ${cronTime} (${timeZone})`,
      );
    } catch (error) {
      this.logger.error(
        `Không thể khởi động lịch Daily Update với cron "${cronTime}"`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async runScheduledDailyUpdates(
    now = new Date(),
  ): Promise<AutomaticDailyUpdateRunResult> {
    const updateDate = this.formatDateInTimeZone(now, this.getTimeZone());
    const result: AutomaticDailyUpdateRunResult = {
      updateDate,
      projects: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
      lockAcquired: false,
    };
    const lockKey = `locks:ai-daily-updates:${updateDate}`;
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
        this.logger.log(`Daily Update ngày ${updateDate} đang được xử lý`);
        return result;
      }

      result.lockAcquired = true;
      const projects =
        await this.projectsRepository.findActiveForAutomaticReports(updateDate);
      result.projects = projects.length;

      for (const project of projects) {
        const [members, activeSprint] = await Promise.all([
          this.workspaceMembersRepository.findActiveByWorkspace(
            project.workspaceId,
          ),
          this.sprintsRepository.findActiveByProject(project.id),
        ]);
        const eligibleMembers = members.filter(
          (member) =>
            member.role !== WorkspaceRole.Viewer &&
            member.user?.status === UserStatus.Active,
        );

        for (const member of eligibleMembers) {
          try {
            const duplicate = await this.dailyUpdatesRepository.findDuplicate(
              project.workspaceId,
              project.id,
              member.userId,
              updateDate,
            );

            if (duplicate) {
              result.skipped += 1;
              continue;
            }

            const inputData =
              await this.dataBuilder.buildPersonalDailyReportInput({
                workspaceId: project.workspaceId,
                projectId: project.id,
                targetUserId: member.userId,
                reportDate: updateDate,
                sprintId: activeSprint?.id,
              });
            const preferences =
              await this.preferencesService.getResolvedPreferences(
                member.userId,
              );
            const prompt = this.promptBuilder.buildDailyUpdateDraftPrompt(
              inputData,
              preferences,
            );
            const generated = await this.aiProvider.generateDailyUpdateDraft(
              prompt,
              inputData,
            );

            // Kiem tra lai ngay truoc khi ghi de tranh race voi nguoi dung.
            const createdWhileGenerating =
              await this.dailyUpdatesRepository.findDuplicate(
                project.workspaceId,
                project.id,
                member.userId,
                updateDate,
              );
            if (createdWhileGenerating) {
              result.skipped += 1;
              continue;
            }

            await this.dailyUpdatesRepository.create({
              workspaceId: project.workspaceId,
              projectId: project.id,
              userId: member.userId,
              sprintId: activeSprint?.id ?? null,
              updateDate,
              yesterdayWork: generated.output.yesterdayWork,
              todayPlan: generated.output.todayPlan,
              blockers: generated.output.blockers || null,
              notes: generated.output.notes
                ? `${AiDailyUpdateSchedulerService.REVIEW_NOTE}\n\n${generated.output.notes}`
                : AiDailyUpdateSchedulerService.REVIEW_NOTE,
              mood: null,
              needHelpFromId: null,
              submissionStatus: DailyUpdateSubmissionStatus.PendingReview,
              generatedByAi: true,
              submittedAt: null,
            });
            await this.notificationsService.create({
              recipientId: member.userId,
              type: NotificationType.DailyUpdateDraftReady,
              title: 'AI đã soạn Daily Update',
              body: 'Vui lòng kiểm tra và gửi bản nháp trước khi ngày làm việc kết thúc.',
              link: `/workspaces/${project.workspaceId}/projects/${project.id}/daily-updates/create?date=${updateDate}`,
              metadata: {
                workspaceId: project.workspaceId,
                projectId: project.id,
                updateDate,
              },
              idempotencyKey: `DAILY_UPDATE_DRAFT_READY:${project.id}:${member.userId}:${updateDate}`,
            });
            result.generated += 1;
          } catch (error) {
            if (this.isDuplicateError(error)) {
              result.skipped += 1;
              continue;
            }

            result.failed += 1;
            this.logger.error(
              `Không thể tạo Daily Update cho user ${member.userId} tại project ${project.id}`,
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      }

      this.logger.log(
        `Đã xử lý Daily Update ${updateDate}: tạo ${result.generated}, bỏ qua ${result.skipped}, lỗi ${result.failed}`,
      );
      return result;
    } catch (error) {
      result.failed += 1;
      this.logger.error(
        `Không thể chạy lịch Daily Update ngày ${updateDate}`,
        error instanceof Error ? error.stack : String(error),
      );
      return result;
    } finally {
      if (result.lockAcquired) {
        await this.releaseLock(lockKey, lockToken);
      }
    }
  }

  async expireUndeliveredDrafts(now = new Date()) {
    const today = this.formatDateInTimeZone(now, this.getTimeZone());
    // Nếu người dùng chưa kịp duyệt trước cuối ngày, dùng nguyên bản nháp AI
    // làm Daily Update chính thức thay vì làm mất báo cáo bằng trạng thái MISSED.
    return this.dailyUpdatesRepository.submitPendingBeforeDate(
      this.nextDate(today),
    );
  }

  async remindUndeliveredDrafts(now = new Date()) {
    const updateDate = this.formatDateInTimeZone(now, this.getTimeZone());
    const drafts =
      await this.dailyUpdatesRepository.findPendingReviewDrafts(updateDate);
    for (const draft of drafts) {
      await this.notificationsService.create({
        recipientId: draft.userId,
        type: NotificationType.DailyUpdateDraftReady,
        title: 'Daily Update vẫn đang chờ duyệt',
        body: 'Bản nháp AI chưa được gửi. Hãy kiểm tra trước khi ngày làm việc kết thúc.',
        link: `/workspaces/${draft.workspaceId}/projects/${draft.projectId}/daily-updates/create?date=${updateDate}`,
        metadata: {
          workspaceId: draft.workspaceId,
          projectId: draft.projectId,
          updateDate,
        },
        idempotencyKey: `DAILY_UPDATE_DRAFT_REMINDER:${draft.projectId}:${draft.userId}:${updateDate}`,
      });
    }
    return { reminded: drafts.length };
  }

  private nextDate(date: string) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day + 1))
      .toISOString()
      .slice(0, 10);
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
        `Không thể giải phóng khóa Redis ${lockKey}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private isDuplicateError(error: unknown) {
    const candidate = error as { code?: string; errno?: number };
    return candidate?.code === 'ER_DUP_ENTRY' || candidate?.errno === 1062;
  }

  private getTimeZone() {
    return this.configService.get<string>(
      'AI_DAILY_UPDATE_TIMEZONE',
      this.configService.get<string>(
        'AI_DAILY_REPORT_TIMEZONE',
        'Asia/Bangkok',
      ),
    );
  }

  private getLockTtlSeconds() {
    const value = Number(
      this.configService.get<string>(
        'AI_DAILY_UPDATE_LOCK_TTL_SECONDS',
        '3600',
      ),
    );
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3600;
  }

  private getBoolean(key: string, fallback: boolean) {
    const value = this.configService.get<string | boolean>(key);
    if (value === undefined) return fallback;
    return (
      value === true ||
      ['true', '1', 'yes'].includes(String(value).toLowerCase())
    );
  }
}
