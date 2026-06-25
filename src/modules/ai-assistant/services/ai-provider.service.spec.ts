import { AiProviderService } from './ai-provider.service';
import { PersonalReportInputData } from './ai-report-data-builder.service';

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
});
