import { NotificationType } from '../../notifications/entities/notification.entity';
import { TaskDeadlineNotificationSchedulerService } from './task-deadline-notification-scheduler.service';

describe('TaskDeadlineNotificationSchedulerService', () => {
  it('classifies due-soon and overdue tasks and creates stable idempotency keys', async () => {
    const tasksRepository = {
      findDueNotificationCandidates: jest.fn().mockResolvedValue([
        { id: 'overdue', taskCode: 'PRO-1', title: 'Old', dueDate: '2026-08-08', assigneeId: 'u1', projectId: 'p1', project: { workspaceId: 'w1' } },
        { id: 'soon', taskCode: 'PRO-2', title: 'Soon', dueDate: '2026-08-11', assigneeId: 'u2', projectId: 'p1', project: { workspaceId: 'w1' } },
      ]),
    };
    const notificationsService = { create: jest.fn().mockResolvedValue({}) };
    const configService = { get: jest.fn((_key: string, fallback?: unknown) => fallback) };
    const service = new TaskDeadlineNotificationSchedulerService(
      configService as never,
      {} as never,
      tasksRepository as never,
      notificationsService as never,
    );

    const result = await service.run(new Date('2026-08-10T03:00:00.000Z'));

    expect(result).toEqual({ candidates: 2, sent: 2 });
    expect(notificationsService.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: NotificationType.TaskOverdue, idempotencyKey: 'TASK_OVERDUE:overdue:2026-08-08' }),
    );
    expect(notificationsService.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ type: NotificationType.TaskDueSoon, idempotencyKey: 'TASK_DUE_SOON:soon:2026-08-11' }),
    );
  });
});
