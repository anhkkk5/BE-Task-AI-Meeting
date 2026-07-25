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
var MeetingAutoCompleteSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingAutoCompleteSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const ioredis_1 = __importDefault(require("ioredis"));
const node_crypto_1 = require("node:crypto");
const redis_constants_1 = require("../../../database/redis/redis.constants");
const meetings_repository_1 = require("../repositories/meetings.repository");
const meetings_service_1 = require("../services/meetings.service");
let MeetingAutoCompleteSchedulerService = MeetingAutoCompleteSchedulerService_1 = class MeetingAutoCompleteSchedulerService {
    configService;
    schedulerRegistry;
    redis;
    meetingsRepository;
    meetingsService;
    logger = new common_1.Logger(MeetingAutoCompleteSchedulerService_1.name);
    jobName = 'meeting-auto-complete';
    constructor(configService, schedulerRegistry, redis, meetingsRepository, meetingsService) {
        this.configService = configService;
        this.schedulerRegistry = schedulerRegistry;
        this.redis = redis;
        this.meetingsRepository = meetingsRepository;
        this.meetingsService = meetingsService;
    }
    onApplicationBootstrap() {
        if (!this.getBoolean('MEETING_AUTO_COMPLETE_ENABLED', true)) {
            this.logger.log('Lich tu dong chot cuoc hop dang tat');
            return;
        }
        const cronTime = this.configService.get('MEETING_AUTO_COMPLETE_CRON', '0 */5 * * * *');
        const timeZone = this.getTimeZone();
        try {
            const job = cron_1.CronJob.from({
                cronTime,
                timeZone,
                start: false,
                waitForCompletion: true,
                onTick: () => void this.runScheduledAutoComplete(),
                errorHandler: (error) => this.logger.error('Lich tu dong chot cuoc hop gap loi', error),
            });
            this.schedulerRegistry.addCronJob(this.jobName, job);
            job.start();
            this.logger.log(`Da bat lich tu dong chot cuoc hop: ${cronTime} (${timeZone}), grace ${this.getGraceMinutes()} phut`);
        }
        catch (error) {
            this.logger.error(`Khong the khoi dong lich chot cuoc hop voi cron "${cronTime}"`, error instanceof Error ? error.stack : String(error));
        }
    }
    async runScheduledAutoComplete(now = new Date()) {
        const result = {
            candidates: 0,
            completed: 0,
            failed: 0,
            lockAcquired: false,
        };
        const lockKey = 'locks:meeting-auto-complete';
        const lockToken = (0, node_crypto_1.randomUUID)();
        try {
            const lock = await this.redis.set(lockKey, lockToken, 'EX', this.getLockTtlSeconds(), 'NX');
            if (lock !== 'OK') {
                this.logger.debug('Mot tien trinh khac dang chot cuoc hop, bo qua luot');
                return result;
            }
            result.lockAcquired = true;
            const cutoff = new Date(now.getTime() - this.getGraceMinutes() * 60 * 1000);
            const meetings = await this.meetingsRepository.findDueForAutoComplete(cutoff);
            result.candidates = meetings.length;
            for (const meeting of meetings) {
                try {
                    const completed = await this.meetingsService.autoCompleteMeeting(meeting);
                    if (completed) {
                        result.completed += 1;
                        this.logger.log(`Da tu dong chot cuoc hop ${meeting.id} (${meeting.title})`);
                    }
                }
                catch (error) {
                    result.failed += 1;
                    this.logger.error(`Khong the tu dong chot cuoc hop ${meeting.id}`, error instanceof Error ? error.stack : String(error));
                }
            }
            return result;
        }
        finally {
            if (result.lockAcquired) {
                await this.releaseLock(lockKey, lockToken);
            }
        }
    }
    async releaseLock(lockKey, lockToken) {
        try {
            await this.redis.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", 1, lockKey, lockToken);
        }
        catch (error) {
            this.logger.warn(`Khong the giai phong khoa Redis ${lockKey}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    getGraceMinutes() {
        const value = Number(this.configService.get('MEETING_AUTO_COMPLETE_GRACE_MINUTES', '15'));
        return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 15;
    }
    getLockTtlSeconds() {
        const value = Number(this.configService.get('MEETING_AUTO_COMPLETE_LOCK_TTL_SECONDS', '240'));
        return Number.isFinite(value) && value > 0 ? Math.floor(value) : 240;
    }
    getTimeZone() {
        return this.configService.get('AI_DAILY_REPORT_TIMEZONE', 'Asia/Bangkok');
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
exports.MeetingAutoCompleteSchedulerService = MeetingAutoCompleteSchedulerService;
exports.MeetingAutoCompleteSchedulerService = MeetingAutoCompleteSchedulerService = MeetingAutoCompleteSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(redis_constants_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        schedule_1.SchedulerRegistry,
        ioredis_1.default,
        meetings_repository_1.MeetingsRepository,
        meetings_service_1.MeetingsService])
], MeetingAutoCompleteSchedulerService);
//# sourceMappingURL=meeting-auto-complete-scheduler.service.js.map