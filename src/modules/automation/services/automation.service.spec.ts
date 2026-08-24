import { AutomationService } from './automation.service';

describe('AutomationService', () => {
  const rule: any = {
    id: 'rule-1',
    workspaceId: 'w',
    projectId: 'p',
    createdBy: 'u',
    enabled: true,
    trigger: { type: 'DUE_DATE', daysBefore: 1 },
    conditions: [],
    actions: [{ type: 'NOTIFY_ASSIGNEE' }],
  };
  const task: any = {
    id: 'task-1',
    projectId: 'p',
    taskCode: 'P-1',
    title: 'Ship',
    assigneeId: 'member',
    dueDate: '2099-01-01',
  };
  const repo: any = {
    findExecution: jest.fn(),
    saveRun: jest.fn(async (x) => x),
  };
  const tasksRepo: any = {
    findDueNotificationCandidates: jest.fn(async () => [task]),
  };
  const notifications: any = { create: jest.fn(async () => ({})) };
  const service = new AutomationService(
    repo,
    tasksRepo,
    {} as any,
    notifications,
    {} as any,
    {} as any,
  );

  beforeEach(() => jest.clearAllMocks());
  it('executes a matching action and records a successful run', async () => {
    repo.findExecution.mockResolvedValue(null);
    const result = await service.runRule(rule);
    expect(notifications.create).toHaveBeenCalledTimes(1);
    expect(result[0].status).toBe('SUCCESS');
  });
  it('does not execute the same rule-task-day key twice', async () => {
    repo.findExecution.mockResolvedValue({ id: 'existing' });
    const result = await service.runRule(rule);
    expect(notifications.create).not.toHaveBeenCalled();
    expect(result[0].status).toBe('SKIPPED');
  });
});
