import { Injectable } from '@nestjs/common';
import {
  MeetingSummaryActionItem,
  MeetingSummaryOutput,
} from '../schemas/meeting-summary.schema';
import {
  PersonalDailyReportOutput,
  TeamDailyReportOutput,
} from '../schemas/ai-report.schema';
import { MeetingSummaryInputData } from './ai-meeting-summary-data-builder.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';

export type AiProviderResult<TOutput = PersonalDailyReportOutput> = {
  model: string;
  rawResponse: string;
  output: TOutput;
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

  async generateTeamDailyReport(
    prompt: string,
    inputData: TeamReportInputData,
  ): Promise<AiProviderResult<TeamDailyReportOutput>> {
    const provider = process.env.AI_PROVIDER ?? 'mock';
    const apiKey = process.env.AI_API_KEY ?? '';

    if (provider !== 'mock' && apiKey) {
      const result = await this.resolveTeamMockResponse(
        prompt,
        inputData,
        provider,
      );
      return result;
    }

    const result = await this.resolveTeamMockResponse(
      prompt,
      inputData,
      'mock',
    );
    return result;
  }

  async generateMeetingSummary(
    prompt: string,
    inputData: MeetingSummaryInputData,
  ): Promise<AiProviderResult<MeetingSummaryOutput>> {
    const provider = process.env.AI_PROVIDER ?? 'mock';
    const apiKey = process.env.AI_API_KEY ?? '';

    if (provider !== 'mock' && apiKey) {
      const result = await this.resolveMeetingSummaryMockResponse(
        prompt,
        inputData,
        provider,
      );
      return result;
    }

    const result = await this.resolveMeetingSummaryMockResponse(
      prompt,
      inputData,
      'mock',
    );
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

  private resolveTeamMockResponse(
    prompt: string,
    inputData: TeamReportInputData,
    provider: string,
  ): Promise<AiProviderResult<TeamDailyReportOutput>> {
    return Promise.resolve(
      this.generateTeamMockResponse(prompt, inputData, provider),
    );
  }

  private resolveMeetingSummaryMockResponse(
    prompt: string,
    inputData: MeetingSummaryInputData,
    provider: string,
  ): Promise<AiProviderResult<MeetingSummaryOutput>> {
    return Promise.resolve(
      this.generateMeetingSummaryMockResponse(prompt, inputData, provider),
    );
  }

  private generateMeetingSummaryMockResponse(
    prompt: string,
    inputData: MeetingSummaryInputData,
    provider: string,
  ) {
    const model = process.env.AI_MODEL || `${provider}-meeting-summary`;
    const transcriptLines = this.getTranscriptLines(inputData);
    const keyPoints = transcriptLines.slice(0, 6);
    const decisions = transcriptLines
      .filter((line) => this.hasDecisionSignal(line))
      .slice(0, 8);
    const actionItems = transcriptLines
      .filter((line) => this.hasActionSignal(line))
      .slice(0, 8)
      .map((line) => this.toMeetingActionItem(line));
    const risks = transcriptLines
      .filter((line) => this.hasRiskSignal(line))
      .slice(0, 8);
    const openQuestions = transcriptLines
      .filter((line) => line.includes('?') || /cau hoi|hoi lai/i.test(line))
      .slice(0, 8);
    const nextSteps = actionItems.length
      ? actionItems.map((item) => item.text).slice(0, 5)
      : [];
    const participantText = inputData.participants.length
      ? `${inputData.participants.length} participant`
      : 'chua co participant trong du lieu';
    const summary = [
      `Meeting "${inputData.meeting.title}" co ${transcriptLines.length} dong transcript va ${participantText}.`,
      keyPoints.length
        ? `Noi dung chinh: ${keyPoints.slice(0, 3).join(' ')}`
        : 'Transcript chua co noi dung du de tong hop.',
    ].join(' ');
    const output: MeetingSummaryOutput = {
      title: `Tom tat meeting - ${inputData.meeting.title}`,
      summary,
      keyPoints,
      decisions,
      actionItems,
      risks,
      openQuestions,
      nextSteps,
      generatedText: [
        `Tom tat meeting - ${inputData.meeting.title}`,
        '',
        `Tong quan: ${summary}`,
        keyPoints.length
          ? `Y chinh: ${keyPoints.join('; ')}`
          : 'Y chinh: Chua co du lieu.',
        decisions.length
          ? `Quyet dinh: ${decisions.join('; ')}`
          : 'Quyet dinh: Chua co du lieu.',
        actionItems.length
          ? `Action items: ${actionItems.map((item) => item.text).join('; ')}`
          : 'Action items: Chua co du lieu.',
        risks.length
          ? `Rui ro: ${risks.join('; ')}`
          : 'Rui ro: Chua co du lieu.',
        openQuestions.length
          ? `Cau hoi mo: ${openQuestions.join('; ')}`
          : 'Cau hoi mo: Chua co du lieu.',
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

  private getTranscriptLines(inputData: MeetingSummaryInputData) {
    if (inputData.transcript.speakers.length) {
      return inputData.transcript.speakers
        .map((speaker) =>
          [speaker.speakerName, speaker.text].filter(Boolean).join(': ').trim(),
        )
        .filter(Boolean);
    }

    return inputData.transcript.normalizedTranscript
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private hasDecisionSignal(line: string) {
    return /quyet dinh|thong nhat|chot|dong y|approved|decided/i.test(line);
  }

  private hasActionSignal(line: string) {
    return /\b(se|can|phai|todo|action|lam|xu ly)\b/i.test(line);
  }

  private hasRiskSignal(line: string) {
    return /rui ro|blocker|tre|qua han|chan|risk|delay|issue/i.test(line);
  }

  private toMeetingActionItem(line: string): MeetingSummaryActionItem {
    const [maybeSpeaker, ...rest] = line.split(':');
    const assigneeName = rest.length ? maybeSpeaker.trim() : null;

    return {
      text: line,
      assigneeName: assigneeName || null,
      assigneeUserId: null,
      dueDate: null,
      status: 'OPEN',
      source: line,
    };
  }

  private generateTeamMockResponse(
    prompt: string,
    inputData: TeamReportInputData,
    provider: string,
  ) {
    const model = process.env.AI_MODEL || `${provider}-team-report`;
    const completedWork = inputData.tasks
      .filter((task) => task.status === 'DONE')
      .map((task) => `${task.taskCode} - ${task.title}`);
    const todayFocus = inputData.dailyUpdates
      .map(
        (dailyUpdate) =>
          `${dailyUpdate.fullName}: ${dailyUpdate.todayPlan || 'Chua co du lieu'}`,
      )
      .slice(0, 10);
    const blockers = inputData.blockers.map(
      (blocker) => `${blocker.fullName}: ${blocker.blocker}`,
    );
    const missingDailyUpdates = inputData.missingDailyUpdateMembers.map(
      (member) => `${member.fullName} chua gui daily update.`,
    );
    const risks = [
      ...inputData.overdueTasks.map(
        (task) =>
          `${task.taskCode} - ${task.title} qua han tu ${task.dueDate ?? 'khong ro ngay'}.`,
      ),
      ...inputData.highPriorityTasks
        .filter((task) => task.status !== 'DONE' && task.status !== 'CANCELLED')
        .map(
          (task) =>
            `${task.taskCode} - ${task.title} dang o muc uu tien ${task.priority}.`,
        ),
    ].slice(0, 12);
    const recommendations = [
      ...(blockers.length
        ? ['Scrum Master can xu ly cac blocker truoc daily tiep theo.']
        : []),
      ...(inputData.overdueTasks.length
        ? ['Uu tien ra soat va cap nhat cac task qua han.']
        : []),
      ...(missingDailyUpdates.length
        ? ['Nhac cac member con thieu daily update trong hom nay.']
        : []),
      'Tiep tuc cap nhat task va daily update de bao cao AI chinh xac hon.',
    ];
    const sprintName = inputData.sprint?.name ?? inputData.project.name;
    const summaryParts = [
      `Team co ${inputData.members.length} member, ${inputData.dailyUpdates.length} daily update va ${inputData.tasks.length} task trong du lieu cung cap.`,
      completedWork.length
        ? `Da hoan thanh: ${completedWork.join(', ')}.`
        : 'Chua co task DONE trong du lieu cung cap.',
      blockers.length
        ? `Co blocker: ${blockers.join('; ')}.`
        : 'Chua ghi nhan blocker.',
    ];
    const teamProgress = [
      `Task DONE: ${inputData.taskStats.DONE}.`,
      `IN_PROGRESS/REVIEW: ${
        inputData.taskStats.IN_PROGRESS + inputData.taskStats.REVIEW
      }.`,
      `TODO/BACKLOG: ${inputData.taskStats.TODO + inputData.taskStats.BACKLOG}.`,
    ].join(' ');
    const memberSummaries = inputData.members.map((member) => {
      const dailyUpdate = inputData.dailyUpdates.find(
        (item) => item.userId === member.userId,
      );
      const memberBlockers = inputData.blockers
        .filter((blocker) => blocker.userId === member.userId)
        .map((blocker) => blocker.blocker);

      return {
        userId: member.userId,
        fullName: member.fullName,
        summary: dailyUpdate
          ? `${dailyUpdate.yesterdayWork || 'Chua co du lieu hom qua'} Hom nay: ${
              dailyUpdate.todayPlan || 'Chua co du lieu'
            }`
          : 'Chua gui daily update trong ngay bao cao.',
        blockers: memberBlockers,
      };
    });
    const output: TeamDailyReportOutput = {
      title: `Bao cao giao ban nhom - ${sprintName}`,
      summary: summaryParts.join(' '),
      teamProgress,
      completedWork,
      todayFocus,
      blockers,
      risks,
      missingDailyUpdates,
      memberSummaries,
      recommendations,
      generatedText: [
        `Bao cao giao ban nhom - ${sprintName}`,
        '',
        `Tong quan: ${summaryParts.join(' ')}`,
        `Tien do: ${teamProgress}`,
        completedWork.length
          ? `Da hoan thanh: ${completedWork.join(', ')}.`
          : 'Da hoan thanh: Chua co du lieu.',
        todayFocus.length
          ? `Trong tam hom nay: ${todayFocus.join('; ')}.`
          : 'Trong tam hom nay: Chua co du lieu.',
        blockers.length
          ? `Blocker: ${blockers.join('; ')}.`
          : 'Blocker: Chua co du lieu.',
        risks.length
          ? `Rui ro: ${risks.join('; ')}.`
          : 'Rui ro: Chua co du lieu.',
        missingDailyUpdates.length
          ? `Thieu daily update: ${missingDailyUpdates.join(' ')}`
          : 'Tat ca member trong du lieu da co daily update hoac chua co danh sach member.',
        `De xuat: ${recommendations.join(' ')}`,
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
