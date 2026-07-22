import { MeetingSummaryInputData } from './ai-meeting-summary-data-builder.service';
import { PersonalizedMeetingSummaryInputData } from './ai-personalized-meeting-summary-data-builder.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';
import { ResolvedAiUserPreferences } from '../../users/types/ai-user-preferences.type';
export declare class PromptBuilderService {
    buildPersonalDailyReportPrompt(inputData: PersonalReportInputData, preferences?: ResolvedAiUserPreferences): string;
    buildTeamDailyReportPrompt(inputData: TeamReportInputData): string;
    buildMeetingSummaryPrompt(inputData: MeetingSummaryInputData): string;
    buildPersonalizedMeetingSummaryPrompt(inputData: PersonalizedMeetingSummaryInputData, preferences?: ResolvedAiUserPreferences): string;
    private buildPersonalization;
}
