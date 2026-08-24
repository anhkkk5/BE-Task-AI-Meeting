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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiDailyUpdateSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiDailyUpdateSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const ioredis_1 = __importDefault(require("ioredis"));
const node_crypto_1 = require("node:crypto");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const redis_constants_1 = require("../../../database/redis/redis.constants");
const daily_updates_repository_1 = require("../../daily-updates/repositories/daily-updates.repository");
const projects_repository_1 = require("../../projects/repositories/projects.repository");
const sprints_repository_1 = require("../../sprints/repositories/sprints.repository");
const ai_user_preferences_service_1 = require("../../users/services/ai-user-preferences.service");
const user_status_enum_1 = require("../../users/enums/user-status.enum");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const ai_provider_service_1 = require("../services/ai-provider.service");
const ai_report_data_builder_service_1 = require("../services/ai-report-data-builder.service");
const prompt_builder_service_1 = require("../services/prompt-builder.service");
const AI_AUTO_NOTE = '[AI_AUTO_DAILY_UPDATE]\nBản cập nhật này được AI tự động tạo lúc 00:00 vì bạn chưa gửi Daily Update trong ngày. Vui lòng kiểm tra và chỉnh sửa nếu cần.';
let AiDailyUpdateSchedulerService = AiDailyUpdateSchedulerService_1 = class AiDailyUpdateSchedulerService {
    configService;
    schedulerRegistry;
    redis;
    projectsRepository;
    workspaceMembersRepository;
    sprintsRepository;
    dailyUpdatesRepository;
    dataBuilder;
    promptBuilder;
    aiProvider;
    preferencesService;
    logger = new common_1.Logger(AiDailyUpdateSchedulerService_1.name);
    jobName = 'automatic-ai-daily-updates';
    constructor(configService, schedulerRegistry, redis, projectsRepository, workspaceMembersRepository, sprintsRepository, dailyUpdatesRepository, dataBuilder, promptBuilder, aiProvider, preferencesService) {
        this.configService = configService;
        this.schedulerRegistry = schedulerRegistry;
        this.redis = redis;
        this.projectsRepository = projectsRepository;
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.sprintsRepository = sprintsRepository;
        this.dailyUpdatesRepository = dailyUpdatesRepository;
        this.dataBuilder = dataBuilder;
        this.promptBuilder = promptBuilder;
        this.aiProvider = aiProvider;
        this.preferencesService = preferencesService;
    }
    onApplicationBootstrap() {
        if (!this.getBoolean('AI_DAILY_UPDATE_SCHEDULER_ENABLED', false)) {
            this.logger.log('Lịch tạo Daily Update tự động đang tắt');
            return;
        }
        const cronTime = this.configService.get('AI_DAILY_UPDATE_CRON', '0 0 0 * * *');
        const timeZone = this.getTimeZone();
        try {
            const job = cron_1.CronJob.from({
                cronTime,
                timeZone,
                start: false,
                waitForCompletion: true,
                onTick: () => void this.runScheduledDailyUpdates(),
                errorHandler: (error) => this.logger.error('Lịch tạo Daily Update gặp lỗi', error),
            });
            this.schedulerRegistry.addCronJob(this.jobName, job);
            job.start();
            this.logger.log(`Đã bật lịch tạo Daily Update: ${cronTime} (${timeZone})`);
        }
        catch (error) {
            this.logger.error(`Không thể khởi động lịch Daily Update với cron "${cronTime}"`, error instanceof Error ? error.stack : String(error));
        }
    }
    async runScheduledDailyUpdates(now = new Date()) {
        const currentLocalDate = this.formatDateInTimeZone(now, this.getTimeZone());
        const updateDate = this.previousDate(currentLocalDate);
        const result = {
            updateDate,
            projects: 0,
            generated: 0,
            skipped: 0,
            failed: 0,
            lockAcquired: false,
        };
        const lockKey = `locks:ai-daily-updates:${updateDate}`;
        const lockToken = (0, node_crypto_1.randomUUID)();
        try {
            const lock = await this.redis.set(lockKey, lockToken, 'EX', this.getLockTtlSeconds(), 'NX');
            if (lock !== 'OK') {
                this.logger.log(`Daily Update ngày ${updateDate} đang được xử lý`);
                return result;
            }
            result.lockAcquired = true;
            const projects = await this.projectsRepository.findActiveForAutomaticReports(updateDate);
            result.projects = projects.length;
            for (const project of projects) {
                const [members, activeSprint] = await Promise.all([
                    this.workspaceMembersRepository.findActiveByWorkspace(project.workspaceId),
                    this.sprintsRepository.findActiveByProject(project.id),
                ]);
                const eligibleMembers = members.filter((member) => member.role !== workspace_role_enum_1.WorkspaceRole.Viewer &&
                    member.user?.status === user_status_enum_1.UserStatus.Active);
                for (const member of eligibleMembers) {
                    try {
                        const duplicate = await this.dailyUpdatesRepository.findDuplicate(project.workspaceId, project.id, member.userId, updateDate);
                        if (duplicate) {
                            result.skipped += 1;
                            continue;
                        }
                        const inputData = await this.dataBuilder.buildPersonalDailyReportInput({
                            workspaceId: project.workspaceId,
                            projectId: project.id,
                            targetUserId: member.userId,
                            reportDate: updateDate,
                            sprintId: activeSprint?.id,
                        });
                        const preferences = await this.preferencesService.getResolvedPreferences(member.userId);
                        const prompt = this.promptBuilder.buildDailyUpdateDraftPrompt(inputData, preferences);
                        const generated = await this.aiProvider.generateDailyUpdateDraft(prompt, inputData);
                        const createdWhileGenerating = await this.dailyUpdatesRepository.findDuplicate(project.workspaceId, project.id, member.userId, updateDate);
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
                                ? `${AI_AUTO_NOTE}\n\n${generated.output.notes}`
                                : AI_AUTO_NOTE,
                            mood: null,
                            needHelpFromId: null,
                        });
                        result.generated += 1;
                    }
                    catch (error) {
                        if (this.isDuplicateError(error)) {
                            result.skipped += 1;
                            continue;
                        }
                        result.failed += 1;
                        this.logger.error(`Không thể tạo Daily Update cho user ${member.userId} tại project ${project.id}`, error instanceof Error ? error.stack : String(error));
                    }
                }
            }
            this.logger.log(`Đã xử lý Daily Update ${updateDate}: tạo ${result.generated}, bỏ qua ${result.skipped}, lỗi ${result.failed}`);
            return result;
        }
        catch (error) {
            result.failed += 1;
            this.logger.error(`Không thể chạy lịch Daily Update ngày ${updateDate}`, error instanceof Error ? error.stack : String(error));
            return result;
        }
        finally {
            if (result.lockAcquired) {
                await this.releaseLock(lockKey, lockToken);
            }
        }
    }
    previousDate(date) {
        const [year, month, day] = date.split('-').map(Number);
        const previous = new Date(Date.UTC(year, month - 1, day - 1));
        return previous.toISOString().slice(0, 10);
    }
    formatDateInTimeZone(date, timeZone) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(date);
        const getPart = (type) => parts.find((part) => part.type === type)?.value ?? '';
        return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    }
    async releaseLock(lockKey, lockToken) {
        try {
            await this.redis.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", 1, lockKey, lockToken);
        }
        catch (error) {
            this.logger.warn(`Không thể giải phóng khóa Redis ${lockKey}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    isDuplicateError(error) {
        const candidate = error;
        return candidate?.code === 'ER_DUP_ENTRY' || candidate?.errno === 1062;
    }
    getTimeZone() {
        return this.configService.get('AI_DAILY_UPDATE_TIMEZONE', this.configService.get('AI_DAILY_REPORT_TIMEZONE', 'Asia/Bangkok'));
    }
    getLockTtlSeconds() {
        const value = Number(this.configService.get('AI_DAILY_UPDATE_LOCK_TTL_SECONDS', '3600'));
        return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3600;
    }
    getBoolean(key, fallback) {
        const value = this.configService.get(key);
        if (value === undefined)
            return fallback;
        return (value === true ||
            ['true', '1', 'yes'].includes(String(value).toLowerCase()));
    }
};
exports.AiDailyUpdateSchedulerService = AiDailyUpdateSchedulerService;
exports.AiDailyUpdateSchedulerService = AiDailyUpdateSchedulerService = AiDailyUpdateSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        schedule_1.SchedulerRegistry,
        ioredis_1.default,
        projects_repository_1.ProjectsRepository,
        workspace_members_repository_1.WorkspaceMembersRepository,
        sprints_repository_1.SprintsRepository,
        daily_updates_repository_1.DailyUpdatesRepository,
        ai_report_data_builder_service_1.AiReportDataBuilderService,
        prompt_builder_service_1.PromptBuilderService,
        ai_provider_service_1.AiProviderService,
        ai_user_preferences_service_1.AiUserPreferencesService])
], AiDailyUpdateSchedulerService);
//# sourceMappingURL=ai-daily-update-scheduler.service.js.map