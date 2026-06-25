import { Injectable } from '@nestjs/common';
import { PersonalDailyReportOutput } from '../schemas/ai-report.schema';
import { PersonalReportInputData } from './ai-report-data-builder.service';

export type AiProviderResult = {
  model: string;
  rawResponse: string;
  output: PersonalDailyReportOutput;
};

@Injectable()
export class AiProviderService {
  async generatePersonalDailyReport(
    prompt: string,
    inputData: PersonalReportInputData,
  ): Promise<AiProviderResult> {
    const provider = process.env.AI_PROVIDER ?? 'mock';
    const apiKey = process.env.AI_API_KEY ?? '';

    if (provider !== 'mock' && apiKey) {
      const result = await this.resolveMockResponse(
        prompt,
        inputData,
        provider,
      );
      return result;
    }

    const result = await this.resolveMockResponse(prompt, inputData, 'mock');
    return result;
  }

  private resolveMockResponse(
    prompt: string,
    inputData: PersonalReportInputData,
    provider: string,
  ): Promise<AiProviderResult> {
    return Promise.resolve(
      this.generateMockResponse(prompt, inputData, provider),
    );
  }

  private generateMockResponse(
    prompt: string,
    inputData: PersonalReportInputData,
    provider: string,
  ) {
    const model = process.env.AI_MODEL || `${provider}-personal-report`;
    const userName = inputData.user.fullName || inputData.user.email;
    const completedTasks = inputData.taskSummary.completed;
    const inProgressTasks = inputData.taskSummary.inProgress;
    const blockerText = inputData.dailyUpdate?.blockers?.trim();
    const blockers = blockerText ? [blockerText] : [];
    const risks = inputData.taskSummary.overdue.length
      ? [
          `Co ${inputData.taskSummary.overdue.length} task qua han can duoc xu ly.`,
        ]
      : [];
    const recommendations = blockers.length
      ? ['Can Scrum Master hoac Project Manager ho tro xu ly blocker.']
      : [
          'Tiep tuc cap nhat daily update va trang thai task de bao cao chinh xac hon.',
        ];
    const yesterdaySummary =
      inputData.dailyUpdate?.yesterdayWork ?? 'Chua co du lieu daily update.';
    const todayPlanSummary =
      inputData.dailyUpdate?.todayPlan ?? 'Chua co du lieu ke hoach hom nay.';
    const summaryParts = [
      `${userName} co ${inputData.tasks.length} task duoc gan trong project ${inputData.project.keyCode}.`,
      completedTasks.length
        ? `Da hoan thanh: ${completedTasks.join(', ')}.`
        : 'Chua co task hoan thanh trong du lieu cung cap.',
      inProgressTasks.length
        ? `Dang thuc hien: ${inProgressTasks.join(', ')}.`
        : 'Chua co task dang thuc hien trong du lieu cung cap.',
      blockers.length ? `Blocker: ${blockers.join('; ')}.` : '',
    ].filter(Boolean);
    const output: PersonalDailyReportOutput = {
      title: `Bao cao giao ban ca nhan - ${userName}`,
      summary: summaryParts.join(' '),
      yesterdaySummary,
      todayPlanSummary,
      completedTasks,
      inProgressTasks,
      blockers,
      risks,
      recommendations,
      generatedText: [
        `Bao cao giao ban ca nhan - ${userName}`,
        '',
        `Hom qua: ${yesterdaySummary}`,
        `Hom nay: ${todayPlanSummary}`,
        completedTasks.length
          ? `Task da hoan thanh: ${completedTasks.join(', ')}.`
          : 'Task da hoan thanh: Chua co du lieu.',
        inProgressTasks.length
          ? `Task dang thuc hien: ${inProgressTasks.join(', ')}.`
          : 'Task dang thuc hien: Chua co du lieu.',
        blockers.length
          ? `Blocker: ${blockers.join('; ')}.`
          : 'Blocker: Chua co du lieu.',
        risks.length
          ? `Rui ro: ${risks.join('; ')}.`
          : 'Rui ro: Chua co du lieu.',
        `Khuyen nghi: ${recommendations.join(' ')}`,
      ].join('\n'),
    };

    return {
      model,
      output,
      rawResponse: JSON.stringify({
        provider,
        promptLength: prompt.length,
        ...output,
      }),
    };
  }
}
