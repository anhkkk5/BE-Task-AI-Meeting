import { DailyMood } from '../../../common/enums/daily-mood.enum';
import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdate } from '../../daily-updates/entities/daily-update.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { Task } from '../../tasks/entities/task.entity';
import { AiProjectAssistantService } from './ai-project-assistant.service';

describe('AiProjectAssistantService', () => {
  let service: AiProjectAssistantService;

  const sprint = {
    id: 'sprint-1',
    projectId: 'project-1',
    name: 'Sprint 7',
    goal: 'Hoàn thiện trợ lý dự án',
    status: SprintStatus.Active,
    startDate: '2026-07-01',
    endDate: '2026-07-10',
  } as Sprint;

  const createTask = (overrides: Partial<Task> = {}) =>
    ({
      id: 'task-1',
      projectId: 'project-1',
      sprintId: 'sprint-1',
      taskCode: 'AG-1',
      title: 'Xây trợ lý',
      status: TaskStatus.Todo,
      assigneeId: 'user-1',
      dueDate: '2026-07-10',
      estimatedHours: 8,
      storyPoints: 5,
      updatedAt: new Date('2026-07-08T00:00:00.000Z'),
      ...overrides,
    }) as Task;

  beforeEach(() => {
    service = new AiProjectAssistantService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it('returns low risk when work is on schedule and has no warning signal', () => {
    const tasks = [
      createTask({ id: 'done-1', status: TaskStatus.Done }),
      createTask({ id: 'done-2', status: TaskStatus.Done }),
      createTask({ id: 'open-1', status: TaskStatus.InProgress }),
      createTask({ id: 'open-2', status: TaskStatus.Todo }),
    ];

    const result = service.buildRiskAssessment(
      sprint,
      tasks,
      [],
      new Date('2026-07-05T12:00:00.000Z'),
    );

    expect(result.level).toBe('LOW');
    expect(result.score).toBe(0);
    expect(result.metrics.completionRate).toBe(50);
    expect(result.signals).toHaveLength(0);
  });

  it('detects overdue, unassigned, stale tasks and member blockers', () => {
    const tasks = [
      createTask({
        id: 'late-1',
        assigneeId: null,
        dueDate: '2026-07-03',
        updatedAt: new Date('2026-07-01T00:00:00.000Z'),
      }),
      createTask({
        id: 'late-2',
        dueDate: '2026-07-04',
        updatedAt: new Date('2026-07-02T00:00:00.000Z'),
      }),
    ];
    const updates = [
      {
        id: 'update-1',
        userId: 'user-1',
        blockers: 'Chờ quyền truy cập',
        mood: DailyMood.Blocked,
        user: { fullName: 'Nguyễn An' },
      } as DailyUpdate,
    ];

    const result = service.buildRiskAssessment(
      sprint,
      tasks,
      updates,
      new Date('2026-07-09T12:00:00.000Z'),
    );

    expect(result.level).toBe('CRITICAL');
    expect(result.metrics.overdueTasks).toBe(2);
    expect(result.metrics.unassignedTasks).toBe(1);
    expect(result.metrics.staleTasks).toBe(2);
    expect(result.metrics.blockedMembers).toBe(1);
    expect(result.signals.map((signal) => signal.code)).toEqual(
      expect.arrayContaining([
        'PROGRESS_LAG',
        'OVERDUE_TASKS',
        'BLOCKERS',
        'UNASSIGNED_TASKS',
        'STALE_TASKS',
      ]),
    );
  });

  it('marks an active Sprint past its end date as overdue', () => {
    const result = service.buildRiskAssessment(
      sprint,
      [createTask()],
      [],
      new Date('2026-07-12T12:00:00.000Z'),
    );

    expect(result.metrics.remainingDays).toBe(-2);
    expect(
      result.signals.some((signal) => signal.code === 'SPRINT_OVERDUE'),
    ).toBe(true);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('ignores cancelled tasks in Sprint metrics', () => {
    const result = service.buildRiskAssessment(
      { ...sprint, status: SprintStatus.Planned } as Sprint,
      [
        createTask({ id: 'cancelled', status: TaskStatus.Cancelled }),
        createTask({ id: 'planned' }),
      ],
      [],
      new Date('2026-06-30T12:00:00.000Z'),
    );

    expect(result.metrics.totalTasks).toBe(1);
    expect(result.metrics.remainingTasks).toBe(1);
  });
});
