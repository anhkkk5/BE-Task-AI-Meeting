import { Injectable } from '@nestjs/common';
import { personalDailyReportPromptTemplate } from '../prompts/personal-daily-report.prompt';
import { PersonalReportInputData } from './ai-report-data-builder.service';

@Injectable()
export class PromptBuilderService {
  buildPersonalDailyReportPrompt(inputData: PersonalReportInputData) {
    return personalDailyReportPromptTemplate.replace(
      '{{INPUT_DATA}}',
      JSON.stringify(inputData, null, 2),
    );
  }
}
