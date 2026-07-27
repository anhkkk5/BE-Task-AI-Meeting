import { MeetingSummaryInputData } from './ai-meeting-summary-data-builder.service';
import { PersonalizedMeetingSummaryInputData } from './ai-personalized-meeting-summary-data-builder.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';
import { HandoverDraftInputData } from '../types/ai-draft.type';
import { ResolvedAiUserPreferences } from '../../users/types/ai-user-preferences.type';
export declare class PromptBuilderService {
    buildPersonalDailyReportPrompt(inputData: PersonalReportInputData, preferences?: ResolvedAiUserPreferences): string;
    buildDailyUpdateDraftPrompt(inputData: PersonalReportInputData, preferences?: ResolvedAiUserPreferences): string;
    buildHandoverDraftPrompt(inputData: HandoverDraftInputData): string;
    buildTeamDailyReportPrompt(inputData: TeamReportInputData, extraInstruction?: string | null): string;
    private buildExtraInstruction;
    buildMeetingSummaryPrompt(inputData: MeetingSummaryInputData): string;
    buildPersonalizedMeetingSummaryPrompt(inputData: PersonalizedMeetingSummaryInputData, preferences?: ResolvedAiUserPreferences): string;
    private buildPersonalization;
}
