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
let AutoMeetingSummaryListener = AutoMeetingSummaryListener_1 = class AutoMeetingSummaryListener {
    meetingLifecycleService;
    aiMeetingSummaryService;
    logger = new common_1.Logger(AutoMeetingSummaryListener_1.name);
    unsubscribe;
    constructor(meetingLifecycleService, aiMeetingSummaryService) {
        this.meetingLifecycleService = meetingLifecycleService;
        this.aiMeetingSummaryService = aiMeetingSummaryService;
    }
    onModuleInit() {
        this.unsubscribe = this.meetingLifecycleService.onMeetingCompleted((event) => this.generateSummary(event));
    }
    onModuleDestroy() {
        this.unsubscribe?.();
    }
    async generateSummary(event) {
        try {
            await this.aiMeetingSummaryService.generateMeetingSummary(event.currentUserId, event.workspaceId, event.projectId, event.meetingId, { forceRegenerate: false });
            this.logger.log(`Da tu dong tao tom tat cho cuoc hop ${event.meetingId}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Khong the tu dong tao tom tat cho cuoc hop ${event.meetingId}: ${message}`);
        }
    }
};
exports.AutoMeetingSummaryListener = AutoMeetingSummaryListener;
exports.AutoMeetingSummaryListener = AutoMeetingSummaryListener = AutoMeetingSummaryListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meeting_lifecycle_service_1.MeetingLifecycleService,
        ai_meeting_summary_service_1.AiMeetingSummaryService])
], AutoMeetingSummaryListener);
//# sourceMappingURL=auto-meeting-summary.listener.js.map