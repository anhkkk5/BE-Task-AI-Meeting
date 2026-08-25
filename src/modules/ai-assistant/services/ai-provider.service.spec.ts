import { AiProviderService } from './ai-provider.service';
import { PersonalizedMeetingSummaryInputData } from './ai-personalized-meeting-summary-data-builder.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';

describe('AiProviderService', () => {
  const originalAiProvider = process.env.AI_PROVIDER;
  const originalAiApiKey = process.env.AI_API_KEY;
  const originalAiModel = process.env.AI_MODEL;
  const originalOpenAiApiKey = process.env.OPENAI_API_KEY;

  const restoreEnv = (key: string, value: string | undefined) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }

    process.env[key] = value;
  };

  const mockGroqResponse = (output: object) =>
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          model: 'test-groq-model',
          choices: [
            {
              message: {
                content: JSON.stringify(output),
              },
            },
          ],
        }),
      ),
    } as unknown as Response);

  beforeEach(() => {
    process.env.AI_PROVIDER = 'mock';
    delete process.env.AI_API_KEY;
    delete process.env.AI_MODEL;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    restoreEnv('AI_PROVIDER', originalAiProvider);
    restoreEnv('AI_API_KEY', originalAiApiKey);
    restoreEnv('AI_MODEL', originalAiModel);
    restoreEnv('OPENAI_API_KEY', originalOpenAiApiKey);
  });

  const inputData: PersonalReportInputData = {
    user: {
      id: 'member-id',
      fullName: 'Nguyen Van A',
      email: 'member@example.com',
      role: 'MEMBER',
    },
    workspace: {
      id: 'workspace-id',
      name: 'Agile AI',
      slug: 'agile-ai',
    },
    project: {
      id: 'project-id',
      name: 'Project AI',
      keyCode: 'AGILEAI',
      status: 'ACTIVE',
    },
    sprint: null,
    reportDate: '2026-06-20',
    dailyUpdate: {
      id: 'daily-update-id',
      updateDate: '2026-06-20',
      yesterdayWork: 'Hoan thanh API tao task',
      todayPlan: 'Viet test task',
      blockers: 'Can xac nhan rule MEMBER',
      notes: null,
      mood: 'NORMAL',
    },
    tasks: [
      {
        id: 'task-id',
        taskCode: 'AGILEAI-1',
        title: 'Code API tao task',
        status: 'DONE',
        sprintId: null,
        dueDate: '2026-06-20',
        estimatedHours: 6,
        storyPoints: 3,
      },
      {
        id: 'task-id-2',
        taskCode: 'AGILEAI-2',
        title: 'Viet test task',
        status: 'IN_PROGRESS',
        sprintId: null,
        dueDate: '2026-06-21',
        estimatedHours: 4,
        storyPoints: 2,
      },
    ],
    taskSummary: {
      completed: ['AGILEAI-1 - Code API tao task'],
      inProgress: ['AGILEAI-2 - Viet test task'],
      overdue: [],
    },
    handovers: {
      given: [],
      received: [],
      pendingForMe: 0,
    },
  };
  const teamInputData: TeamReportInputData = {
    workspace: {
      id: 'workspace-id',
      name: 'Agile AI',
      slug: 'agile-ai',
    },
    project: {
      id: 'project-id',
      name: 'Project AI',
      keyCode: 'AGILEAI',
      status: 'ACTIVE',
    },
    sprint: {
      id: 'sprint-id',
      name: 'Sprint 1',
      status: 'ACTIVE',
      startDate: '2026-06-20',
      endDate: '2026-06-27',
    },
    reportDate: '2026-06-22',
    members: [
      {
        userId: 'member-id',
        fullName: 'Nguyen Van A',
        email: 'member@example.com',
        role: 'MEMBER',
      },
      {
        userId: 'member-id-2',
        fullName: 'Nguyen Van B',
        email: 'member2@example.com',
        role: 'MEMBER',
      },
    ],
    dailyUpdates: [
      {
        id: 'daily-update-id',
        userId: 'member-id',
        fullName: 'Nguyen Van A',
        updateDate: '2026-06-22',
        yesterdayWork: 'Hoan thanh API daily update',
        todayPlan: 'Viet test case',
        blockers: null,
        notes: null,
        mood: 'NORMAL',
      },
    ],
    missingDailyUpdateMembers: [
      {
        userId: 'member-id-2',
        fullName: 'Nguyen Van B',
        email: 'member2@example.com',
        role: 'MEMBER',
      },
    ],
    taskStats: {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 1,
      REVIEW: 0,
      DONE: 1,
      CANCELLED: 0,
    },
    tasks: [
      {
        id: 'task-id',
        taskCode: 'AGILEAI-1',
        title: 'API daily update',
        status: 'DONE',
        sprintId: 'sprint-id',
        assigneeId: 'member-id',
        assigneeName: 'Nguyen Van A',
        dueDate: '2026-06-22',
        estimatedHours: 6,
        storyPoints: 3,
      },
      {
        id: 'task-id-2',
        taskCode: 'AGILEAI-2',
        title: 'Meeting Module',
        status: 'IN_PROGRESS',
        sprintId: 'sprint-id',
        assigneeId: 'member-id-2',
        assigneeName: 'Nguyen Van B',
        dueDate: '2026-06-21',
        estimatedHours: 8,
        storyPoints: 5,
      },
    ],
    overdueTasks: [
      {
        id: 'task-id-2',
        taskCode: 'AGILEAI-2',
        title: 'Meeting Module',
        status: 'IN_PROGRESS',
        sprintId: 'sprint-id',
        assigneeId: 'member-id-2',
        assigneeName: 'Nguyen Van B',
        dueDate: '2026-06-21',
        estimatedHours: 8,
        storyPoints: 5,
      },
    ],
    blockers: [],
    handovers: [],
    handoverStats: {
      total: 0,
      acknowledged: 0,
      pending: 0,
      changesRequested: 0,
      rejected: 0,
    },
    meetingNotes: [],
    previousReport: null,
    dataSources: {
      tasks: true,
      dailyUpdates: true,
      meetingTranscripts: true,
      previousReport: false,
    },
  };
  const personalizedMeetingInputData: PersonalizedMeetingSummaryInputData = {
    workspace: {
      id: 'workspace-id',
    },
    project: {
      id: 'project-id',
      name: 'Project AI',
      keyCode: 'AGILEAI',
      status: 'ACTIVE',
    },
    sprint: null,
    meeting: {
      id: 'meeting-id',
      title: 'Sprint Planning',
      description: null,
      meetingType: 'SPRINT_PLANNING',
      meetingDate: '2026-06-25',
      status: 'COMPLETED',
    },
    targetUser: {
      userId: 'member-id',
      fullName: 'Nguyen Van B',
      email: 'member2@example.com',
    },
    participants: [
      {
        userId: 'member-id',
        fullName: 'Nguyen Van B',
        email: 'member2@example.com',
        role: 'PARTICIPANT',
        attended: true,
      },
    ],
    meetingSummary: {
      id: 'meeting-summary-id',
      title: 'Tom tat meeting',
      summary: 'Team thong nhat sprint goal.',
      keyPoints: ['Nguyen Van B se lam API task'],
      decisions: ['Nguyen Van B thong nhat lam API task'],
      actionItems: [
        {
          text: 'Nguyen Van B: Em se lam API task',
          assigneeName: 'Nguyen Van B',
          assigneeUserId: null,
          dueDate: null,
          status: 'OPEN',
          source: 'Nguyen Van B: Em se lam API task',
        },
      ],
      risks: [],
      openQuestions: [],
      nextSteps: ['Nguyen Van B: Em se lam API task'],
    },
    relatedTranscriptSnippets: ['Nguyen Van B: Em se lam API task'],
    targetActionItems: [
      {
        text: 'Nguyen Van B: Em se lam API task',
        assigneeName: 'Nguyen Van B',
        assigneeUserId: null,
        dueDate: null,
        status: 'OPEN',
        source: 'Nguyen Van B: Em se lam API task',
      },
    ],
    assignedTasks: [
      {
        id: 'task-id',
        taskCode: 'AGILEAI-9',
        title: 'API task dependency',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2026-06-27',
        sprintId: null,
        isBlocked: true,
      },
    ],
    transcriptId: 'transcript-id',
    generatedAt: '2026-06-25T00:00:00.000Z',
  };

  it('generates deterministic mock report from provided data only', async () => {
    const service = new AiProviderService();

    const result = await service.generatePersonalDailyReport(
      'prompt without token',
      inputData,
    );

    expect(result.model).toContain('mock');
    expect(result.output.title).toContain('Nguyen Van A');
    expect(result.output.completedTasks).toEqual([
      'AGILEAI-1 - Code API tao task',
    ]);
    expect(result.output.inProgressTasks).toEqual([
      'AGILEAI-2 - Viet test task',
    ]);
    expect(result.output.blockers).toEqual(['Can xac nhan rule MEMBER']);
    expect(result.output.generatedText).not.toContain('password');
    expect(result.output.generatedText).not.toContain('token');
  });

  it('generates deterministic mock team report from team data only', async () => {
    const service = new AiProviderService();

    const result = await service.generateTeamDailyReport(
      'prompt without token',
      teamInputData,
    );

    expect(result.model).toContain('mock');
    expect(result.output.title).toContain('Sprint 1');
    expect(result.output.completedWork).toEqual([
      'AGILEAI-1 - API daily update',
    ]);
    expect(result.output.missingDailyUpdates).toEqual([
      'Nguyen Van B chua gui daily update.',
    ]);
    expect(result.output.risks?.join(' ')).toContain('AGILEAI-2');
    expect(result.output.generatedText).not.toContain('password');
    expect(result.output.generatedText).not.toContain('token');
  });

  it('generates personalized meeting summary without inventing deadline or secrets', async () => {
    const service = new AiProviderService();

    const result = await service.generatePersonalizedMeetingSummary(
      'prompt without token',
      personalizedMeetingInputData,
    );

    expect(result.model).toContain('mock');
    expect(result.output.title).toContain('Nguyen Van B');
    expect(result.output.myActionItems).toHaveLength(1);
    expect(result.output.myActionItems[0]).toMatchObject({
      title: 'Nguyen Van B: Em se lam API task',
      deadline: null,
      source: 'Nguyen Van B: Em se lam API task',
    });
    expect(result.output.generatedText).not.toContain('password');
    expect(result.output.generatedText).not.toContain('token');
  });

  it('classifies Vietnamese meeting evidence and removes off-topic chatter in fallback mode', async () => {
    const service = new AiProviderService();
    const result = await service.generateMeetingSummary('prompt', {
      workspace: { id: 'workspace-id' },
      project: { id: 'project-id', name: 'Project AI', keyCode: 'AI', status: 'ACTIVE' },
      meeting: {
        id: 'meeting-id', title: 'Rà soát phát hành', description: null,
        meetingType: 'GENERAL', meetingDate: '2026-08-25', status: 'COMPLETED',
        startTime: null, endTime: null,
      },
      sprint: null,
      participants: [
        { userId: 'u1', fullName: 'An', email: 'an@example.com', role: 'HOST', attended: true },
        { userId: 'u2', fullName: 'Bình', email: 'binh@example.com', role: 'PARTICIPANT', attended: true },
      ],
      transcript: {
        id: 'transcript-id', rawTranscript: '', normalizedTranscript: '',
        speakers: [
          { userId: 'u1', speakerName: 'An', text: 'Mục tiêu là rà soát các blocker còn lại.' },
          { userId: 'u1', speakerName: 'An', text: 'Quyết định không cho task sang Done nếu dependency chưa hoàn thành.' },
          { userId: 'u2', speakerName: 'Bình', text: 'Mình sẽ sửa validation dependency trước thứ Sáu.' },
          { userId: 'u2', speakerName: 'Bình', text: 'Cuối tuần đi uống cà phê không?' },
          { userId: 'u1', speakerName: 'An', text: 'Staging đang chậm do thiếu tài nguyên database.' },
        ],
      },
      generatedAt: '2026-08-25T00:00:00.000Z',
    });

    expect(result.output.decisions.join(' ')).toContain('Quyết định');
    expect(result.output.actionItems).toHaveLength(1);
    expect(result.output.openQuestions).toEqual([]);
    expect(result.output.risks.join(' ')).not.toContain('Mục tiêu');
    expect(JSON.stringify(result.output)).not.toContain('cà phê');
  });

  it('calls Groq for a personal daily report and preserves its response shape', async () => {
    process.env.AI_PROVIDER = 'groq';
    process.env.AI_API_KEY = 'test-api-key';
    process.env.AI_MODEL = 'test-groq-model';
    const fetchSpy = mockGroqResponse({
      title: 'Báo cáo cá nhân',
      summary: 'Đã hoàn thành API tạo task.',
      yesterdaySummary: 'Hoàn thành API tạo task.',
      todayPlanSummary: 'Viết kiểm thử cho task.',
      completedTasks: ['AGILEAI-1 - Code API tạo task'],
      inProgressTasks: ['AGILEAI-2 - Viết kiểm thử task'],
      blockers: ['Cần xác nhận quyền thành viên.'],
      risks: [],
      recommendations: ['Xác nhận quyền trước khi tiếp tục.'],
      generatedText: 'Báo cáo cá nhân đã được tổng hợp.',
    });
    const service = new AiProviderService();

    const result = await service.generatePersonalDailyReport(
      'personal prompt',
      inputData,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchSpy.mock.calls[0];
    const requestHeaders = new Headers(requestInit?.headers);
    expect(requestUrl).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(requestInit?.method).toBe('POST');
    expect(requestHeaders.get('Authorization')).toBe('Bearer test-api-key');
    expect(result.model).toBe('test-groq-model');
    expect(result.output.title).toBe('Báo cáo cá nhân');
    expect(result.output.completedTasks).toEqual([
      'AGILEAI-1 - Code API tạo task',
    ]);
  });

  it('calls OpenAI with the OpenAI key and supported JSON options', async () => {
    process.env.AI_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.AI_MODEL = 'gpt-5.6-luna';
    const fetchSpy = mockGroqResponse({
      title: 'Personal report',
      summary: 'API task completed.',
      yesterdaySummary: 'API task completed.',
      todayPlanSummary: 'Test the task API.',
      completedTasks: ['AGILEAI-1 - Code API tao task'],
      inProgressTasks: ['AGILEAI-2 - Viet test task'],
      blockers: [],
      risks: [],
      recommendations: ['Continue testing the API.'],
      generatedText: 'Personal report generated.',
    });
    const service = new AiProviderService();

    const result = await service.generatePersonalDailyReport(
      'personal prompt',
      inputData,
    );

    const [requestUrl, requestInit] = fetchSpy.mock.calls[0];
    const requestHeaders = new Headers(requestInit?.headers);
    const requestBody = JSON.parse(String(requestInit?.body)) as Record<
      string,
      unknown
    >;
    expect(requestUrl).toBe('https://api.openai.com/v1/chat/completions');
    expect(requestHeaders.get('authorization')).toBe('Bearer test-openai-key');
    expect(requestBody.model).toBe('gpt-5.6-luna');
    expect(requestBody.response_format).toEqual({ type: 'json_object' });
    expect(requestBody.temperature).toBeUndefined();
    expect(result.output.completedTasks).toEqual([
      'AGILEAI-1 - Code API tao task',
    ]);
  });

  it('calls Groq for a team daily report and normalizes member summaries', async () => {
    process.env.AI_PROVIDER = 'groq';
    process.env.AI_API_KEY = 'test-api-key';
    process.env.AI_MODEL = 'test-groq-model';
    const fetchSpy = mockGroqResponse({
      title: 'Báo cáo nhóm Sprint 1',
      summary: 'Nhóm đang triển khai đúng kế hoạch.',
      teamProgress: 'Một task hoàn thành, một task đang làm.',
      completedWork: ['AGILEAI-1 - API daily update'],
      todayFocus: ['Hoàn thành Meeting Module'],
      blockers: [],
      risks: ['AGILEAI-2 đang quá hạn.'],
      missingDailyUpdates: ['Nguyen Van B chưa gửi cập nhật.'],
      memberSummaries: [
        {
          userId: 'member-id',
          fullName: 'Nguyen Van A',
          summary: 'Đã hoàn thành API.',
          blockers: [],
        },
      ],
      recommendations: ['Rà soát task quá hạn.'],
      generatedText: 'Báo cáo nhóm đã được tổng hợp.',
    });
    const service = new AiProviderService();

    const result = await service.generateTeamDailyReport(
      'team prompt',
      teamInputData,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.model).toBe('test-groq-model');
    expect(result.output.memberSummaries).toEqual([
      {
        userId: 'member-id',
        fullName: 'Nguyen Van A',
        summary: 'Đã hoàn thành API.',
        blockers: [],
      },
    ]);
  });

  it('calls Groq for a personalized meeting summary', async () => {
    process.env.AI_PROVIDER = 'groq';
    process.env.AI_API_KEY = 'test-api-key';
    process.env.AI_MODEL = 'test-groq-model';
    const fetchSpy = mockGroqResponse({
      title: 'Tóm tắt dành cho Nguyen Van B',
      personalSummary: 'Bạn được giao phát triển API task.',
      relevantDecisions: ['Thống nhất triển khai API task.'],
      myActionItems: [
        {
          title: 'Phát triển API task',
          assigneeId: 'member-id',
          assigneeName: 'Nguyen Van B',
          deadline: null,
          source: 'Nguyen Van B: Em sẽ làm API task',
        },
      ],
      mentions: ['Nguyen Van B được nhắc trong phần phân công.'],
      risks: [],
      nextSteps: ['Bắt đầu phát triển API task.'],
      generatedText: 'Tóm tắt cá nhân đã được tạo.',
    });
    const service = new AiProviderService();

    const result = await service.generatePersonalizedMeetingSummary(
      'personalized meeting prompt',
      personalizedMeetingInputData,
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.model).toBe('test-groq-model');
    expect(result.output.personalSummary).toContain('API task');
    expect(result.output.myActionItems[0]).toMatchObject({
      assigneeId: 'member-id',
      deadline: null,
    });
  });
});
