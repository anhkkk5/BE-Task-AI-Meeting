import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { MailService } from '../../mail/services/mail.service';
import { ShiftHandover } from '../entities/shift-handover.entity';
import { HandoverEventsService } from '../services/handover-events.service';
import { HandoverNotificationListener } from './handover-notification.listener';

/**
 * Kiem tra dung nguoi nhan duoc mail cho tung su kien ban giao.
 *
 * Diem de sai nhat cua tinh nang nay khong phai la "co gui mail hay khong" ma la
 * "gui cho ai": submitted phai den nguoi nhan, con accepted/rejected/
 * changes_requested phai quay ve nguoi giao.
 */
describe('HandoverNotificationListener', () => {
  const buildHandover = (): ShiftHandover =>
    ({
      id: 'handover-1',
      workspaceId: 'ws-1',
      projectId: 'pj-1',
      taskId: 'task-1',
      senderId: 'user-sender',
      receiverId: 'user-receiver',
      title: 'Ban giao ca sang',
      completedWork: 'Da xong phan A',
      remainingWork: 'Con phan B',
      blockers: null,
      dueAt: null,
      status: HandoverStatus.Pending,
      sender: {
        id: 'user-sender',
        email: 'sender@example.com',
        fullName: 'Nguoi Giao',
      },
      receiver: {
        id: 'user-receiver',
        email: 'receiver@example.com',
        fullName: 'Nguoi Nhan',
      },
      task: { taskCode: 'TASK-1', title: 'Sua bug dang nhap' },
    }) as unknown as ShiftHandover;

  const setup = () => {
    const events = new HandoverEventsService();
    const sendMailSafely = jest.fn().mockResolvedValue(true);
    const mailService = { sendMailSafely } as unknown as MailService;
    const listener = new HandoverNotificationListener(events, mailService);

    listener.onModuleInit();

    return { events, sendMailSafely };
  };

  /** publish khong await listener, nen phai nhuong micro-task truoc khi assert. */
  const flush = () => new Promise((resolve) => setImmediate(resolve));

  it('gui mail cho nguoi nhan khi ban giao duoc gui di', async () => {
    const { events, sendMailSafely } = setup();

    events.publish({ type: 'submitted', handover: buildHandover() });
    await flush();

    expect(sendMailSafely).toHaveBeenCalledTimes(1);
    const mail = sendMailSafely.mock.calls[0][0];
    expect(mail.to).toBe('receiver@example.com');
    expect(mail.subject).toContain('TASK-1');
    expect(mail.text).toContain('Nguoi Giao');
    // Link phai tro dung route frontend, khong phai /handovers.
    expect(mail.text).toContain(
      '/workspaces/ws-1/projects/pj-1/shift-handovers',
    );
  });

  it('gui mail cho nguoi giao khi ban giao duoc tiep nhan', async () => {
    const { events, sendMailSafely } = setup();

    events.publish({ type: 'accepted', handover: buildHandover() });
    await flush();

    const mail = sendMailSafely.mock.calls[0][0];
    expect(mail.to).toBe('sender@example.com');
    expect(mail.text).toContain('Nguoi Nhan');
  });

  it('gui mail kem ly do cho nguoi giao khi bi tu choi', async () => {
    const { events, sendMailSafely } = setup();

    events.publish({
      type: 'rejected',
      handover: buildHandover(),
      reason: 'Thieu thong tin ban giao',
    });
    await flush();

    const mail = sendMailSafely.mock.calls[0][0];
    expect(mail.to).toBe('sender@example.com');
    expect(mail.text).toContain('Thieu thong tin ban giao');
  });

  it('gui mail kem noi dung can bo sung khi yeu cau chinh sua', async () => {
    const { events, sendMailSafely } = setup();

    events.publish({
      type: 'changes_requested',
      handover: buildHandover(),
      reason: 'Bo sung link tai lieu',
    });
    await flush();

    const mail = sendMailSafely.mock.calls[0][0];
    expect(mail.to).toBe('sender@example.com');
    expect(mail.text).toContain('Bo sung link tai lieu');
  });

  it('bo qua gui mail khi khong co email nguoi nhan', async () => {
    const { events, sendMailSafely } = setup();
    const handover = buildHandover();
    (handover as { receiver: unknown }).receiver = null;

    events.publish({ type: 'submitted', handover });
    await flush();

    expect(sendMailSafely).not.toHaveBeenCalled();
  });

  it('loi gui mail khong lam vo luong publish', async () => {
    const events = new HandoverEventsService();
    const sendMailSafely = jest.fn().mockRejectedValue(new Error('SMTP chet'));
    const mailService = { sendMailSafely } as unknown as MailService;
    const listener = new HandoverNotificationListener(events, mailService);
    listener.onModuleInit();

    expect(() =>
      events.publish({ type: 'submitted', handover: buildHandover() }),
    ).not.toThrow();
    await flush();
  });
});
