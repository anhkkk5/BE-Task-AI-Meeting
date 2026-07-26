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
var AiDailyReportSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiDailyReportSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const ioredis_1 = __importDefault(require("ioredis"));
const node_crypto_1 = require("node:crypto");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const redis_constants_1 = require("../../../database/redis/redis.constants");
const projects_repository_1 = require("../../projects/repositories/projects.repository");
const user_status_enum_1 = require("../../users/enums/user-status.enum");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const ai_personal_report_service_1 = require("../services/ai-personal-report.service");
const ai_team_report_service_1 = require("../services/ai-team-report.service");
let AiDailyReportSchedulerService = AiDailyReportSchedulerService_1 = class AiDailyReportSchedulerService {
    configService;
    schedulerRegistry;
    redis;
    projectsRepository;
    workspaceMembersRepository;
    personalReportService;
    teamReportService;
    logger = new common_1.Logger(AiDailyReportSchedulerService_1.name);
    jobName = 'automatic-ai-daily-reports';
    lastRunKey = 'ai-daily-reports:last-run';
    constructor(configService, schedulerRegistry, redis, projectsRepository, workspaceMembersRepository, personalReportService, teamReportService) {
        this.configService = configService;
        this.schedulerRegistry = schedulerRegistry;
        this.redis = redis;
        this.projectsRepository = projectsRepository;
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.personalReportService = personalReportService;
        this.teamReportService = teamReportService;
    }
    onApplicationBootstrap() {
        if (!this.getBoolean('AI_DAILY_REPORT_SCHEDULER_ENABLED', false)) {
            this.logger.log('Lich tao bao cao giao ban tu dong dang tat');
            return;
        }
        if (!this.getBoolean('MONGODB_ENABLED', false)) {
            this.logger.warn('Khong khoi dong lich bao cao giao ban vi MongoDB dang tat');
            return;
        }
        const cronTime = this.configService.get('AI_DAILY_REPORT_CRON', '0 0 17 * * 1-5');
        const timeZone = this.getTimeZone();
        try {
            const job = cron_1.CronJob.from({
                cronTime,
                timeZone,
                start: false,
                waitForCompletion: true,
                onTick: () => void this.runScheduledReports(),
                errorHandler: (error) => this.logger.error('Lich tao bao cao giao ban gap loi', error),
            });
            this.schedulerRegistry.addCronJob(this.jobName, job);
            job.start();
            this.logger.log(`Da bat lich tao bao cao giao ban: ${cronTime} (${timeZone})`);
        }
        catch (error) {
            this.logger.error(`Khong the khoi dong lich bao cao voi cron "${cronTime}"`, error instanceof Error ? error.stack : String(error));
        }
    }
    async runScheduledReports(now = new Date()) {
        const reportDate = this.formatDateInTimeZone(now, this.getTimeZone());
        const result = {
            reportDate,
            projects: 0,
            generated: 0,
            skipped: 0,
            failed: 0,
            lockAcquired: false,
        };
        const lockKey = `locks:ai-daily-reports:${reportDate}`;
        const lockToken = (0, node_crypto_1.randomUUID)();
        try {
            const lock = await this.redis.set(lockKey, lockToken, 'EX', this.getLockTtlSeconds(), 'NX');
            if (lock !== 'OK') {
                this.logger.log(`Bao cao giao ban ngay ${reportDate} dang duoc xu ly`);
                return result;
            }
            result.lockAcquired = true;
            const projects = await this.projectsRepository.findActiveForAutomaticReports(reportDate);
            result.projects = projects.length;
            for (const project of projects) {
                const members = await this.workspaceMembersRepository.findActiveByWorkspace(project.workspaceId);
                const activeMembers = members.filter((member) => member.role !== workspace_role_enum_1.WorkspaceRole.Viewer &&
                    member.user?.status === user_status_enum_1.UserStatus.Active);
                const manager = this.findReportManager(activeMembers);
                if (!manager) {
                    result.skipped +=
                        activeMembers.length +
                            (this.getBoolean('AI_DAILY_REPORT_INCLUDE_TEAM', true) ? 1 : 0);
                    this.logger.warn(`Bo qua project ${project.id}: khong co nguoi quan ly hop le`);
                    continue;
                }
                for (const member of activeMembers) {
                    try {
                        const generated = await this.personalReportService.generateScheduledPersonalDailyReport(manager.userId, project.workspaceId, project.id, member.userId, reportDate);
                        result[generated.generated ? 'generated' : 'skipped'] += 1;
                    }
                    catch (error) {
                        result.failed += 1;
                        this.logger.error(`Khong the tao bao cao ca nhan cho user ${member.userId} tai project ${project.id}`, error instanceof Error ? error.stack : String(error));
                    }
                }
                if (this.getBoolean('AI_DAILY_REPORT_INCLUDE_TEAM', true)) {
                    try {
                        const generated = await this.teamReportService.generateScheduledTeamDailyReport(manager.userId, project.workspaceId, project.id, reportDate);
                        result[generated.generated ? 'generated' : 'skipped'] += 1;
                    }
                    catch (error) {
                        result.failed += 1;
                        this.logger.error(`Khong the tao bao cao nhom tai project ${project.id}`, error instanceof Error ? error.stack : String(error));
                    }
                }
            }
            this.logger.log(`Da xu ly bao cao giao ban ${reportDate}: tao ${result.generated}, bo qua ${result.skipped}, loi ${result.failed}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Khong the chay lich bao cao giao ban ngay ${reportDate}`, error instanceof Error ? error.stack : String(error));
            result.failed += 1;
            return result;
        }
        finally {
            if (result.lockAcquired) {
                await this.saveLastRun(result);
                await this.releaseLock(lockKey, lockToken);
            }
        }
    }
    async getAutomationStatus() {
        return {
            enabled: this.getBoolean('AI_DAILY_REPORT_SCHEDULER_ENABLED', false),
            cron: this.configService.get('AI_DAILY_REPORT_CRON', '0 0 17 * * 1-5'),
            timeZone: this.getTimeZone(),
            includeTeam: this.getBoolean('AI_DAILY_REPORT_INCLUDE_TEAM', true),
            nextRunAt: this.resolveNextRunAt(),
            lastRun: await this.getLastRun(),
        };
    }
    resolveNextRunAt() {
        try {
            const job = this.schedulerRegistry.getCronJob(this.jobName);
            const next = job.nextDate();
            if (typeof next?.toJSDate === 'function') {
                return next.toJSDate().toISOString();
            }
            if (typeof next?.toMillis === 'function') {
                return new Date(next.toMillis()).toISOString();
            }
            return null;
        }
        catch {
            return null;
        }
    }
    async saveLastRun(result) {
        const payload = {
            ...result,
            finishedAt: new Date().toISOString(),
        };
        try {
            await this.redis.set(this.lastRunKey, JSON.stringify(payload));
        }
        catch (error) {
            this.logger.warn(`Khong the luu trang thai lan chay gan nhat: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getLastRun() {
        try {
            const raw = await this.redis.get(this.lastRunKey);
            return raw ? JSON.parse(raw) : null;
        }
        catch {
            return null;
        }
    }
    findReportManager(members) {
        const roleOrder = [
            workspace_role_enum_1.WorkspaceRole.Owner,
            workspace_role_enum_1.WorkspaceRole.ScrumMaster,
            workspace_role_enum_1.WorkspaceRole.ProjectManager,
        ];
        for (const role of roleOrder) {
            const member = members.find((item) => item.role === role);
            if (member) {
                return member;
            }
        }
        return null;
    }
    async releaseLock(lockKey, lockToken) {
        try {
            await this.redis.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", 1, lockKey, lockToken);
        }
        catch (error) {
            this.logger.warn(`Khong the giai phong khoa Redis ${lockKey}: ${error instanceof Error ? error.message : String(error)}`);
        }
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
    getTimeZone() {
        return this.configService.get('AI_DAILY_REPORT_TIMEZONE', 'Asia/Bangkok');
    }
    getLockTtlSeconds() {
        const value = Number(this.configService.get('AI_DAILY_REPORT_LOCK_TTL_SECONDS', '3600'));
        return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3600;
    }
    getBoolean(key, fallback) {
        const value = this.configService.get(key);
        if (value === undefined) {
            return fallback;
        }
        return (value === true ||
            ['true', '1', 'yes'].includes(String(value).toLowerCase()));
    }
};
exports.AiDailyReportSchedulerService = AiDailyReportSchedulerService;
exports.AiDailyReportSchedulerService = AiDailyReportSchedulerService = AiDailyReportSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        schedule_1.SchedulerRegistry,
        ioredis_1.default,
        projects_repository_1.ProjectsRepository,
        workspace_members_repository_1.WorkspaceMembersRepository,
        ai_personal_report_service_1.AiPersonalReportService,
        ai_team_report_service_1.AiTeamReportService])
], AiDailyReportSchedulerService);
//# sourceMappingURL=ai-daily-report-scheduler.service.js.map