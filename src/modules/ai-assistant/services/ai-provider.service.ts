import { Injectable } from '@nestjs/common';
import {
  MeetingSummaryActionItem,
  MeetingSummaryOutput,
} from '../schemas/meeting-summary.schema';
import {
  PersonalizedMeetingActionItem,
  PersonalizedMeetingSummaryOutput,
} from '../schemas/personalized-meeting-summary.schema';
import {
  PersonalDailyReportOutput,
  TeamDailyReportOutput,
} from '../schemas/ai-report.schema';
import { MeetingSummaryInputData } from './ai-meeting-summary-data-builder.service';
import { PersonalizedMeetingSummaryInputData } from './ai-personalized-meeting-summary-data-builder.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';

export type AiProviderResult<TOutput = PersonalDailyReportOutput> = {
  model: string;
  rawResponse: string;
  output: TOutput;
};

type GroqChatResponse = {
  model?: string;
  choices?: {
    message?: {
      content?: string | null;
    };
  }[];
};

@Injectable()
export class AiProviderService {
  async generatePersonalDailyReport(
    prompt: string,
    inputData: PersonalReportInputData,
  ): Promise<AiProviderResult> {
    const provider = process.env.AI_PROVIDER ?? 'mock';
    const apiKey = process.env.AI_API_KEY ?? '';

    if (provider === 'groq' && apiKey) {
      return this.generateGroqPersonalDailyReport(prompt, inputData, apiKey);
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

    if (provider === 'groq' && apiKey) {
      return this.generateGroqTeamDailyReport(prompt, inputData, apiKey);
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

    if (provider === 'groq' && apiKey) {
      return this.generateGroqMeetingSummary(prompt, inputData, apiKey);
    }

    const result = await this.resolveMeetingSummaryMockResponse(
      prompt,
      inputData,
      'mock',
    );
    return result;
  }

  async generatePersonalizedMeetingSummary(
    prompt: string,
    inputData: PersonalizedMeetingSummaryInputData,
  ): Promise<AiProviderResult<PersonalizedMeetingSummaryOutput>> {
    const provider = process.env.AI_PROVIDER ?? 'mock';
    const apiKey = process.env.AI_API_KEY ?? '';

    if (provider === 'groq' && apiKey) {
      return this.generateGroqPersonalizedMeetingSummary(
        prompt,
        inputData,
        apiKey,
      );
    }

    const result = await this.resolvePersonalizedMeetingSummaryMockResponse(
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

  private resolvePersonalizedMeetingSummaryMockResponse(
    prompt: string,
    inputData: PersonalizedMeetingSummaryInputData,
    provider: string,
  ): Promise<AiProviderResult<PersonalizedMeetingSummaryOutput>> {
    return Promise.resolve(
      this.generatePersonalizedMeetingSummaryMockResponse(
        prompt,
        inputData,
        provider,
      ),
    );
  }

  private async generateGroqPersonalDailyReport(
    prompt: string,
    inputData: PersonalReportInputData,
    apiKey: string,
  ): Promise<AiProviderResult<PersonalDailyReportOutput>> {
    const model = this.getGroqModel();
    const output = await this.callGroqJson<PersonalDailyReportOutput>({
      apiKey,
      model,
      system:
        'Bạn là trợ lý Scrum. Chỉ trả về JSON hợp lệ bằng tiếng Việt, không dùng markdown và không thêm dữ liệu ngoài thông tin được cung cấp.',
      user: [
        prompt,
        '',
        'Trả về đúng cấu trúc JSON sau:',
        JSON.stringify(
          {
            title: 'string',
            summary: 'string',
            yesterdaySummary: 'string',
            todayPlanSummary: 'string',
            completedTasks: ['string'],
            inProgressTasks: ['string'],
            blockers: ['string'],
            risks: ['string'],
            recommendations: ['string'],
            generatedText: 'string',
          },
          null,
          2,
        ),
      ].join('\n'),
    });
    const normalizedOutput = this.normalizePersonalDailyReportOutput(
      output,
      inputData,
    );

    return {
      model,
      rawResponse: JSON.stringify(output),
      output: normalizedOutput,
    };
  }

  private async generateGroqTeamDailyReport(
    prompt: string,
    inputData: TeamReportInputData,
    apiKey: string,
  ): Promise<AiProviderResult<TeamDailyReportOutput>> {
    const model = this.getGroqModel();
    const output = await this.callGroqJson<TeamDailyReportOutput>({
      apiKey,
      model,
      system:
        'Bạn là trợ lý Scrum Master. Chỉ trả về JSON hợp lệ bằng tiếng Việt, không dùng markdown và không thêm dữ liệu ngoài thông tin được cung cấp.',
      user: [
        prompt,
        '',
        'Trả về đúng cấu trúc JSON sau:',
        JSON.stringify(
          {
            title: 'string',
            summary: 'string',
            teamProgress: 'string',
            completedWork: ['string'],
            todayFocus: ['string'],
            blockers: ['string'],
            risks: ['string'],
            missingDailyUpdates: ['string'],
            memberSummaries: [
              {
                userId: 'string',
                fullName: 'string',
                summary: 'string',
                blockers: ['string'],
              },
            ],
            recommendations: ['string'],
            generatedText: 'string',
          },
          null,
          2,
        ),
      ].join('\n'),
    });
    const normalizedOutput = this.normalizeTeamDailyReportOutput(
      output,
      inputData,
    );

    return {
      model,
      rawResponse: JSON.stringify(output),
      output: normalizedOutput,
    };
  }

  private async generateGroqPersonalizedMeetingSummary(
    prompt: string,
    inputData: PersonalizedMeetingSummaryInputData,
    apiKey: string,
  ): Promise<AiProviderResult<PersonalizedMeetingSummaryOutput>> {
    const model = this.getGroqModel();
    const output = await this.callGroqJson<PersonalizedMeetingSummaryOutput>({
      apiKey,
      model,
      system:
        'Bạn là trợ lý cuộc họp cá nhân. Chỉ trả về JSON hợp lệ bằng tiếng Việt, không dùng markdown và chỉ dùng dữ liệu liên quan trực tiếp đến người dùng mục tiêu.',
      user: [
        prompt,
        '',
        'Trả về đúng cấu trúc JSON sau:',
        JSON.stringify(
          {
            title: 'string',
            personalSummary: 'string',
            relevantDecisions: ['string'],
            myActionItems: [
              {
                title: 'string',
                assigneeId: 'string or null',
                assigneeName: 'string or null',
                deadline: 'YYYY-MM-DD or null',
                source: 'string or null',
              },
            ],
            mentions: ['string'],
            risks: ['string'],
            nextSteps: ['string'],
            generatedText: 'string',
          },
          null,
          2,
        ),
      ].join('\n'),
    });
    const normalizedOutput = this.normalizePersonalizedMeetingSummaryOutput(
      output,
      inputData,
    );

    return {
      model,
      rawResponse: JSON.stringify(output),
      output: normalizedOutput,
    };
  }

  private async generateGroqMeetingSummary(
    prompt: string,
    inputData: MeetingSummaryInputData,
    apiKey: string,
  ): Promise<AiProviderResult<MeetingSummaryOutput>> {
    const model = this.getGroqModel();
    const output = await this.callGroqJson<MeetingSummaryOutput>({
      apiKey,
      model,
      system:
        'Bạn là trợ lý tóm tắt cuộc họp dự án Agile. Chỉ trả về JSON hợp lệ bằng tiếng Việt có dấu, không dùng markdown và không thêm dữ liệu không có trong biên bản.',
      user: [
        prompt,
        '',
        'Trả về đúng cấu trúc JSON sau:',
        JSON.stringify(
          {
            title: 'string',
            summary: 'string',
            keyPoints: ['string'],
            decisions: ['string'],
            actionItems: [
              {
                text: 'string',
                assigneeName: 'string or null',
                assigneeUserId: 'string or null',
                dueDate: 'YYYY-MM-DD or null',
                status: 'OPEN',
                source: 'string or null',
              },
            ],
            risks: ['string'],
            openQuestions: ['string'],
            nextSteps: ['string'],
            generatedText: 'string',
          },
          null,
          2,
        ),
      ].join('\n'),
    });

    return {
      model,
      rawResponse: JSON.stringify(output),
      output: this.normalizeMeetingSummaryOutput(output, inputData),
    };
  }

  private async callGroqJson<TOutput>(params: {
    apiKey: string;
    model: string;
    system: string;
    user: string;
  }): Promise<TOutput> {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model,
          messages: [
            {
              role: 'system',
              content: params.system,
            },
            {
              role: 'user',
              content: params.user,
            },
          ],
          response_format: {
            type: 'json_object',
          },
          temperature: 0.2,
          max_completion_tokens: 2048,
        }),
      },
    );

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`Groq API failed: ${response.status} ${rawText}`);
    }

    const groqResponse = JSON.parse(rawText) as GroqChatResponse;
    const content = groqResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Groq API returned empty content');
    }

    return this.parseJsonContent<TOutput>(content);
  }

  private parseJsonContent<TOutput>(content: string): TOutput {
    const cleaned = content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    return JSON.parse(cleaned) as TOutput;
  }

  private getGroqModel() {
    return process.env.AI_MODEL || 'llama-3.3-70b-versatile';
  }

  private normalizePersonalDailyReportOutput(
    output: PersonalDailyReportOutput,
    inputData: PersonalReportInputData,
  ): PersonalDailyReportOutput {
    const userName = inputData.user.fullName || inputData.user.email;
    const title = this.normalizeText(
      output.title,
      `Báo cáo giao ban cá nhân - ${userName}`,
    );
    const summary = this.normalizeText(
      output.summary,
      'Chưa có đủ dữ liệu để tổng hợp báo cáo.',
    );

    return {
      title,
      summary,
      yesterdaySummary: this.normalizeText(
        output.yesterdaySummary,
        'Chưa có dữ liệu.',
      ),
      todayPlanSummary: this.normalizeText(
        output.todayPlanSummary,
        'Chưa có dữ liệu.',
      ),
      completedTasks: this.normalizeTextArray(output.completedTasks),
      inProgressTasks: this.normalizeTextArray(output.inProgressTasks),
      blockers: this.normalizeTextArray(output.blockers),
      risks: this.normalizeTextArray(output.risks),
      recommendations: this.normalizeTextArray(output.recommendations),
      generatedText: this.normalizeText(
        output.generatedText,
        `${title}\n\n${summary}`,
      ),
    };
  }

  private normalizeTeamDailyReportOutput(
    output: TeamDailyReportOutput,
    inputData: TeamReportInputData,
  ): TeamDailyReportOutput {
    const scopeName = inputData.sprint?.name ?? inputData.project.name;
    const title = this.normalizeText(
      output.title,
      `Báo cáo giao ban nhóm - ${scopeName}`,
    );
    const summary = this.normalizeText(
      output.summary,
      'Chưa có đủ dữ liệu để tổng hợp báo cáo.',
    );
    const memberSummaries = Array.isArray(output.memberSummaries)
      ? output.memberSummaries
          .filter((item) => item && typeof item === 'object')
          .map((item) => ({
            userId: this.normalizeText(item.userId, ''),
            fullName: this.normalizeText(item.fullName, 'Chưa rõ thành viên'),
            summary: this.normalizeText(item.summary, 'Chưa có dữ liệu.'),
            blockers: this.normalizeTextArray(item.blockers),
          }))
          .filter((item) => item.userId)
      : [];

    return {
      title,
      summary,
      teamProgress: this.normalizeText(
        output.teamProgress,
        'Chưa có dữ liệu tiến độ.',
      ),
      completedWork: this.normalizeTextArray(output.completedWork),
      todayFocus: this.normalizeTextArray(output.todayFocus),
      blockers: this.normalizeTextArray(output.blockers),
      risks: this.normalizeTextArray(output.risks),
      missingDailyUpdates: this.normalizeTextArray(output.missingDailyUpdates),
      memberSummaries,
      recommendations: this.normalizeTextArray(output.recommendations),
      generatedText: this.normalizeText(
        output.generatedText,
        `${title}\n\n${summary}`,
      ),
    };
  }

  private normalizePersonalizedMeetingSummaryOutput(
    output: PersonalizedMeetingSummaryOutput,
    inputData: PersonalizedMeetingSummaryInputData,
  ): PersonalizedMeetingSummaryOutput {
    const targetName =
      inputData.targetUser.fullName || inputData.targetUser.email;
    const title = this.normalizeText(
      output.title,
      `Tóm tắt cuộc họp dành cho ${targetName}`,
    );
    const personalSummary = this.normalizeText(
      output.personalSummary,
      'Chưa có nội dung liên quan trực tiếp.',
    );
    const myActionItems = Array.isArray(output.myActionItems)
      ? output.myActionItems
          .filter((item) => item && typeof item === 'object')
          .map((item) => ({
            title: this.normalizeText(item.title, ''),
            assigneeId: item.assigneeId ?? null,
            assigneeName: item.assigneeName ?? null,
            deadline: item.deadline ?? null,
            source: item.source ?? null,
          }))
          .filter((item) => item.title)
      : [];

    return {
      title,
      personalSummary,
      relevantDecisions: this.normalizeTextArray(output.relevantDecisions),
      myActionItems,
      mentions: this.normalizeTextArray(output.mentions),
      risks: this.normalizeTextArray(output.risks),
      nextSteps: this.normalizeTextArray(output.nextSteps),
      generatedText: this.normalizeText(
        output.generatedText,
        `${title}\n\n${personalSummary}`,
      ),
    };
  }

  private normalizeText(value: unknown, fallback: string) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private normalizeTextArray(value: unknown): string[] {
    return Array.isArray(value)
      ? value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }

  private normalizeMeetingSummaryOutput(
    output: MeetingSummaryOutput,
    inputData: MeetingSummaryInputData,
  ): MeetingSummaryOutput {
    const title =
      typeof output.title === 'string' && output.title.trim()
        ? output.title.trim()
        : `Tom tat meeting - ${inputData.meeting.title}`;
    const summary =
      typeof output.summary === 'string' && output.summary.trim()
        ? output.summary.trim()
        : 'Chua co du lieu du de tong hop.';
    const actionItems = Array.isArray(output.actionItems)
      ? output.actionItems.map((item) => ({
          text: item.text,
          assigneeName: item.assigneeName ?? null,
          assigneeUserId: item.assigneeUserId ?? null,
          dueDate: item.dueDate ?? null,
          status: item.status ?? 'OPEN',
          source: item.source ?? item.text,
        }))
      : [];

    return {
      title,
      summary,
      keyPoints: Array.isArray(output.keyPoints) ? output.keyPoints : [],
      decisions: Array.isArray(output.decisions) ? output.decisions : [],
      actionItems,
      risks: Array.isArray(output.risks) ? output.risks : [],
      openQuestions: Array.isArray(output.openQuestions)
        ? output.openQuestions
        : [],
      nextSteps: Array.isArray(output.nextSteps) ? output.nextSteps : [],
      generatedText:
        typeof output.generatedText === 'string' && output.generatedText.trim()
          ? output.generatedText
          : [
              title,
              '',
              `Tong quan: ${summary}`,
              actionItems.length
                ? `Viec can lam: ${actionItems
                    .map((item) => item.text)
                    .join('; ')}`
                : 'Viec can lam: Chua co du lieu.',
            ].join('\n'),
    };
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

  private generatePersonalizedMeetingSummaryMockResponse(
    prompt: string,
    inputData: PersonalizedMeetingSummaryInputData,
    provider: string,
  ) {
    const model =
      process.env.AI_MODEL || `${provider}-personalized-meeting-summary`;
    const targetName =
      inputData.targetUser.fullName || inputData.targetUser.email;
    const mentions = inputData.relatedTranscriptSnippets.slice(0, 10);
    const myActionItems = inputData.targetActionItems
      .slice(0, 10)
      .map((item) => this.toPersonalizedMeetingActionItem(item));
    const relevantDecisions = inputData.meetingSummary.decisions
      .filter((decision) => this.textMentionsTarget(decision, inputData))
      .slice(0, 8);
    const risks = inputData.meetingSummary.risks
      .filter((risk) => this.textMentionsTarget(risk, inputData))
      .slice(0, 8);
    const nextSteps = myActionItems.map((item) => item.title).slice(0, 8);
    const hasDirectContent =
      mentions.length ||
      myActionItems.length ||
      relevantDecisions.length ||
      risks.length;
    const personalSummary = hasDirectContent
      ? [
          `${targetName} co noi dung lien quan trong meeting "${inputData.meeting.title}".`,
          myActionItems.length
            ? `Action items lien quan: ${myActionItems
                .map((item) => item.title)
                .join('; ')}.`
            : '',
          mentions.length
            ? `Transcript co nhac den: ${mentions.slice(0, 3).join(' ')}`
            : '',
        ]
          .filter(Boolean)
          .join(' ')
      : 'Chua co noi dung lien quan truc tiep';
    const output: PersonalizedMeetingSummaryOutput = {
      title: `Tom tat cuoc hop ca nhan hoa - ${targetName}`,
      personalSummary,
      relevantDecisions,
      myActionItems,
      mentions,
      risks,
      nextSteps,
      generatedText: [
        `Tom tat cuoc hop ca nhan hoa - ${targetName}`,
        '',
        personalSummary,
        relevantDecisions.length
          ? `Quyet dinh lien quan: ${relevantDecisions.join('; ')}`
          : 'Quyet dinh lien quan: Chua co du lieu.',
        myActionItems.length
          ? `Viec can lam: ${myActionItems
              .map((item) => item.title)
              .join('; ')}`
          : 'Viec can lam: Chua co du lieu.',
        mentions.length
          ? `Mentions: ${mentions.join('; ')}`
          : 'Mentions: Chua co du lieu.',
        risks.length
          ? `Rui ro: ${risks.join('; ')}`
          : 'Rui ro: Chua co du lieu.',
        nextSteps.length
          ? `Next steps: ${nextSteps.join('; ')}`
          : 'Next steps: Chua co du lieu.',
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

  private textMentionsTarget(
    text: string,
    inputData: PersonalizedMeetingSummaryInputData,
  ) {
    const normalizedText = text.toLowerCase();
    const targetName = inputData.targetUser.fullName.toLowerCase();

    return (
      Boolean(targetName && normalizedText.includes(targetName)) ||
      normalizedText.includes(inputData.targetUser.email.toLowerCase())
    );
  }

  private toPersonalizedMeetingActionItem(
    item: MeetingSummaryActionItem,
  ): PersonalizedMeetingActionItem {
    return {
      title: item.text,
      assigneeId: item.assigneeUserId ?? null,
      assigneeName: item.assigneeName ?? null,
      deadline: item.dueDate ?? null,
      source: item.source ?? item.text,
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
