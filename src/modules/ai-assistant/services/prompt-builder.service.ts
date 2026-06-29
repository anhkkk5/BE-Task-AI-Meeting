import { Injectable } from '@nestjs/common';
import { MEETING_SUMMARY_PROMPT_TEMPLATE } from '../prompts/meeting-summary.prompt';
import { personalDailyReportPromptTemplate } from '../prompts/personal-daily-report.prompt';
import { TEAM_DAILY_REPORT_PROMPT_TEMPLATE } from '../prompts/team-daily-report.prompt';
import { MeetingSummaryInputData } from './ai-meeting-summary-data-builder.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';

@Injectable()
export class PromptBuilderService {
  buildPersonalDailyReportPrompt(inputData: PersonalReportInputData) {
    return personalDailyReportPromptTemplate.replace(
      '{{INPUT_DATA}}',
      JSON.stringify(inputData, null, 2),
    );
  }

  buildTeamDailyReportPrompt(inputData: TeamReportInputData) {
    return TEAM_DAILY_REPORT_PROMPT_TEMPLATE.replace(
      '{{INPUT_DATA}}',
      JSON.stringify(inputData, null, 2),
    );
  }

  buildMeetingSummaryPrompt(inputData: MeetingSummaryInputData) {
    return MEETING_SUMMARY_PROMPT_TEMPLATE.replace(
      '{{INPUT_DATA}}',
      JSON.stringify(inputData, null, 2),
    );
  }
}
