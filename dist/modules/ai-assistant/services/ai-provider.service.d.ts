import { MeetingSummaryOutput } from '../schemas/meeting-summary.schema';
import { PersonalDailyReportOutput, TeamDailyReportOutput } from '../schemas/ai-report.schema';
import { MeetingSummaryInputData } from './ai-meeting-summary-data-builder.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';
export type AiProviderResult<TOutput = PersonalDailyReportOutput> = {
    model: string;
    rawResponse: string;
    output: TOutput;
};
export declare class AiProviderService {
    generatePersonalDailyReport(prompt: string, inputData: PersonalReportInputData): Promise<AiProviderResult>;
    generateTeamDailyReport(prompt: string, inputData: TeamReportInputData): Promise<AiProviderResult<TeamDailyReportOutput>>;
    generateMeetingSummary(prompt: string, inputData: MeetingSummaryInputData): Promise<AiProviderResult<MeetingSummaryOutput>>;
    private resolveMockResponse;
    private generateMockResponse;
    private resolveTeamMockResponse;
    private resolveMeetingSummaryMockResponse;
    private generateMeetingSummaryMockResponse;
    private getTranscriptLines;
    private hasDecisionSignal;
    private hasActionSignal;
    private hasRiskSignal;
    private toMeetingActionItem;
    private generateTeamMockResponse;
}
