import { AiProviderService } from './ai-provider.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';
import { TeamReportInputData } from './ai-team-report-data-builder.service';

describe('AiProviderService', () => {
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
        priority: 'HIGH',
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
        priority: 'MEDIUM',
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
        priority: 'HIGH',
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
        priority: 'URGENT',
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
        priority: 'URGENT',
        sprintId: 'sprint-id',
        assigneeId: 'member-id-2',
        assigneeName: 'Nguyen Van B',
        dueDate: '2026-06-21',
        estimatedHours: 8,
        storyPoints: 5,
      },
    ],
    highPriorityTasks: [],
    blockers: [],
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
});
