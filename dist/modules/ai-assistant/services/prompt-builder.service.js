"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilderService = void 0;
const common_1 = require("@nestjs/common");
const meeting_summary_prompt_1 = require("../prompts/meeting-summary.prompt");
const personal_daily_report_prompt_1 = require("../prompts/personal-daily-report.prompt");
const team_daily_report_prompt_1 = require("../prompts/team-daily-report.prompt");
let PromptBuilderService = class PromptBuilderService {
    buildPersonalDailyReportPrompt(inputData) {
        return personal_daily_report_prompt_1.personalDailyReportPromptTemplate.replace('{{INPUT_DATA}}', JSON.stringify(inputData, null, 2));
    }
    buildTeamDailyReportPrompt(inputData) {
        return team_daily_report_prompt_1.TEAM_DAILY_REPORT_PROMPT_TEMPLATE.replace('{{INPUT_DATA}}', JSON.stringify(inputData, null, 2));
    }
    buildMeetingSummaryPrompt(inputData) {
        return meeting_summary_prompt_1.MEETING_SUMMARY_PROMPT_TEMPLATE.replace('{{INPUT_DATA}}', JSON.stringify(inputData, null, 2));
    }
};
exports.PromptBuilderService = PromptBuilderService;
exports.PromptBuilderService = PromptBuilderService = __decorate([
    (0, common_1.Injectable)()
], PromptBuilderService);
//# sourceMappingURL=prompt-builder.service.js.map