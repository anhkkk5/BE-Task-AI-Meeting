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
var AutoMeetingSummaryListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoMeetingSummaryListener = void 0;
const common_1 = require("@nestjs/common");
const meeting_lifecycle_service_1 = require("../../meetings/services/meeting-lifecycle.service");
const ai_meeting_summary_service_1 = require("../services/ai-meeting-summary.service");
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 30_000;
let AutoMeetingSummaryListener = AutoMeetingSummaryListener_1 = class AutoMeetingSummaryListener {
    meetingLifecycleService;
    aiMeetingSummaryService;
    logger = new common_1.Logger(AutoMeetingSummaryListener_1.name);
    unsubscribe;
    pendingRetries = new Set();
    constructor(meetingLifecycleService, aiMeetingSummaryService) {
        this.meetingLifecycleService = meetingLifecycleService;
        this.aiMeetingSummaryService = aiMeetingSummaryService;
    }
    onModuleInit() {
        this.unsubscribe = this.meetingLifecycleService.onMeetingCompleted((event) => this.generateSummary(event));
    }
    onModuleDestroy() {
        this.unsubscribe?.();
        for (const timeout of this.pendingRetries) {
            clearTimeout(timeout);
        }
        this.pendingRetries.clear();
    }
    async generateSummary(event, attempt = 1) {
        const source = event.reason === 'AUTO' ? 'tu dong' : 'thu cong';
        try {
            await this.aiMeetingSummaryService.generateMeetingSummary(event.currentUserId, event.workspaceId, event.projectId, event.meetingId, { forceRegenerate: false });
            this.logger.log(`Da tao tom tat cho cuoc hop ${event.meetingId} (chot ${source})`);
        }
        catch (error) {
            if (this.isMissingTranscript(error)) {
                this.logger.warn(`Bo qua tom tat cuoc hop ${event.meetingId}: chua co bien ban nao duoc ghi. ` +
                    'Nguoi tham gia can bat ghi bien ban trong phong hop de AI co du lieu.');
                return;
            }
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Khong the tao tom tat cho cuoc hop ${event.meetingId} (lan ${attempt}/${MAX_RETRY_ATTEMPTS + 1}): ${message}`);
            if (attempt <= MAX_RETRY_ATTEMPTS) {
                this.scheduleRetry(event, attempt + 1);
            }
        }
    }
    scheduleRetry(event, nextAttempt) {
        const timeout = setTimeout(() => {
            this.pendingRetries.delete(timeout);
            void this.generateSummary(event, nextAttempt);
        }, RETRY_DELAY_MS);
        timeout.unref?.();
        this.pendingRetries.add(timeout);
        this.logger.log(`Se thu tao lai tom tat cuoc hop ${event.meetingId} sau ${RETRY_DELAY_MS / 1000} giay`);
    }
    isMissingTranscript(error) {
        if (error instanceof common_1.NotFoundException) {
            return true;
        }
        const message = error instanceof Error ? error.message : String(error);
        return /transcript/i.test(message) && /not found|khong tim thay/i.test(message);
    }
};
exports.AutoMeetingSummaryListener = AutoMeetingSummaryListener;
exports.AutoMeetingSummaryListener = AutoMeetingSummaryListener = AutoMeetingSummaryListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meeting_lifecycle_service_1.MeetingLifecycleService,
        ai_meeting_summary_service_1.AiMeetingSummaryService])
], AutoMeetingSummaryListener);
//# sourceMappingURL=auto-meeting-summary.listener.js.map