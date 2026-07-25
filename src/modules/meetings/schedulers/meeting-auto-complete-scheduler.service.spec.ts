import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { Meeting } from '../entities/meeting.entity';
import { MeetingAutoCompleteSchedulerService } from './meeting-auto-complete-scheduler.service';

type ConfigMap = Record<string, string>;

const buildMeeting = (overrides: Partial<Meeting> = {}) =>
  ({
    id: 'meeting-1',
    workspaceId: 'workspace-1',
    projectId: 'project-1',
    title: 'Daily Standup',
    createdBy: 'owner-1',
    status: MeetingStatus.Scheduled,
    meetingDate: '2026-06-20',
    endTime: new Date('2026-06-20T09:00:00.000Z'),
    ...overrides,
  }) as Meeting;

describe('MeetingAutoCompleteSchedulerService', () => {
  let configValues: ConfigMap;
  let configService: { get: jest.Mock };
  let schedulerRegistry: { addCronJob: jest.Mock };
  let redis: { set: jest.Mock; eval: jest.Mock };
  let meetingsRepository: { findDueForAutoComplete: jest.Mock };
  let meetingsService: { autoCompleteMeeting: jest.Mock };
  let service: MeetingAutoCompleteSchedulerService;
  // Cron job that duoc start se giu timer song, lam Jest khong thoat.
  let registeredJobs: { stop: () => void }[];

  const createService = () =>
    new MeetingAutoCompleteSchedulerService(
      configService as never,
      schedulerRegistry as never,
      redis as never,
      meetingsRepository as never,
      meetingsService as never,
    );

  beforeEach(() => {
    configValues = {};
    configService = {
      get: jest.fn(
        (key: string, fallback?: string) => configValues[key] ?? fallback,
      ),
    };
    registeredJobs = [];
    schedulerRegistry = {
      addCronJob: jest.fn((_name: string, job: { stop: () => void }) => {
        registeredJobs.push(job);
      }),
    };
    redis = {
      set: jest.fn().mockResolvedValue('OK'),
      eval: jest.fn().mockResolvedValue(1),
    };
    meetingsRepository = {
      findDueForAutoComplete: jest.fn().mockResolvedValue([]),
    };
    meetingsService = {
      autoCompleteMeeting: jest.fn().mockResolvedValue(true),
    };
    service = createService();
  });

  afterEach(() => {
    registeredJobs.forEach((job) => job.stop());
  });

  it('does not register cron job when scheduler is disabled', () => {
    configValues.MEETING_AUTO_COMPLETE_ENABLED = 'false';

    createService().onApplicationBootstrap();

    expect(schedulerRegistry.addCronJob).not.toHaveBeenCalled();
  });

  it('registers cron job by default', () => {
    service.onApplicationBootstrap();

    expect(schedulerRegistry.addCronJob).toHaveBeenCalledTimes(1);
  });

  it('applies grace period when computing the cutoff time', async () => {
    configValues.MEETING_AUTO_COMPLETE_GRACE_MINUTES = '15';
    const now = new Date('2026-06-20T10:00:00.000Z');

    await createService().runScheduledAutoComplete(now);

    const cutoff = meetingsRepository.findDueForAutoComplete.mock
      .calls[0][0] as Date;
    expect(cutoff.toISOString()).toBe('2026-06-20T09:45:00.000Z');
  });

  it('completes every due meeting and releases the lock', async () => {
    meetingsRepository.findDueForAutoComplete.mockResolvedValue([
      buildMeeting({ id: 'meeting-1' }),
      buildMeeting({ id: 'meeting-2', status: MeetingStatus.InProgress }),
    ]);

    const result = await service.runScheduledAutoComplete(
      new Date('2026-06-20T10:00:00.000Z'),
    );

    expect(result.candidates).toBe(2);
    expect(result.completed).toBe(2);
    expect(result.failed).toBe(0);
    expect(meetingsService.autoCompleteMeeting).toHaveBeenCalledTimes(2);
    expect(redis.eval).toHaveBeenCalledTimes(1);
  });

  it('skips the run when another process holds the lock', async () => {
    redis.set.mockResolvedValue(null);

    const result = await service.runScheduledAutoComplete();

    expect(result.lockAcquired).toBe(false);
    expect(meetingsRepository.findDueForAutoComplete).not.toHaveBeenCalled();
    expect(redis.eval).not.toHaveBeenCalled();
  });

  it('keeps processing remaining meetings when one fails', async () => {
    meetingsRepository.findDueForAutoComplete.mockResolvedValue([
      buildMeeting({ id: 'meeting-1' }),
      buildMeeting({ id: 'meeting-2' }),
    ]);
    meetingsService.autoCompleteMeeting
      .mockRejectedValueOnce(new Error('database timeout'))
      .mockResolvedValueOnce(true);

    const result = await service.runScheduledAutoComplete(
      new Date('2026-06-20T10:00:00.000Z'),
    );

    expect(result.failed).toBe(1);
    expect(result.completed).toBe(1);
    expect(meetingsService.autoCompleteMeeting).toHaveBeenCalledTimes(2);
  });
});
