import { MeetingSummaryInputData } from './ai-meeting-summary-data-builder.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';
export declare class PromptBuilderService {
    buildPersonalDailyReportPrompt(inputData: PersonalReportInputData): string;
    buildTeamDailyReportPrompt(inputData: TeamReportInputData): string;
    buildMeetingSummaryPrompt(inputData: MeetingSummaryInputData): string;
}
