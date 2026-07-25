import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { AiReportDataBuilderService } from './ai-report-data-builder.service';
import { AiTeamReportDataBuilderService } from './ai-team-report-data-builder.service';

type HandoverSeed = {
  id: string;
  senderId: string;
  receiverId: string;
  status: HandoverStatus;
  senderName: string;
  receiverName: string;
};

const buildHandover = (seed: HandoverSeed) => ({
  id: seed.id,
  senderId: seed.senderId,
  receiverId: seed.receiverId,
  status: seed.status,
  completedWork: 'Da xong phan API',
  remainingWork: 'Con lai phan test',
  blockers: 'Cho review',
  notes: null,
  task: { taskCode: 'TASK-1', title: 'Lam API dang nhap' },
  sender: { fullName: seed.senderName },
  receiver: { fullName: seed.receiverName },
});

const emptyPage = { items: [], total: 0, page: 1, limit: 100 };

describe('Ban giao cong viec trong du lieu bao cao AI', () => {
  let shiftHandoversRepository: {
    findByProjectAndDate: jest.Mock;
    findPendingByReceiver: jest.Mock;
  };

  beforeEach(() => {
    shiftHandoversRepository = {
      findByProjectAndDate: jest.fn().mockResolvedValue([]),
      findPendingByReceiver: jest.fn().mockResolvedValue([]),
    };
  });

  describe('Bao cao ca nhan', () => {
    const buildService = () => {
      const dailyUpdatesRepository = {
        findMy: jest.fn().mockResolvedValue(emptyPage),
      };
      const projectAccessService = {
        assertProjectInWorkspace: jest.fn().mockResolvedValue({
          id: 'project-1',
          name: 'Du an A',
          keyCode: 'DAA',
          status: 'ACTIVE',
        }),
      };
      const sprintAccessService = { assertSprintInProject: jest.fn() };
      const tasksRepository = {
        findByProject: jest.fn().mockResolvedValue(emptyPage),
      };
      const usersService = {
        findById: jest.fn().mockResolvedValue({
          id: 'user-1',
          fullName: 'Nguyen Van A',
          email: 'a@example.com',
        }),
      };
      const workspaceAccessService = {
        assertWorkspaceActive: jest.fn().mockResolvedValue({
          id: 'workspace-1',
          name: 'Workspace',
          slug: 'workspace',
        }),
        assertWorkspaceMember: jest.fn().mockResolvedValue({ role: 'MEMBER' }),
      };

      return new AiReportDataBuilderService(
        dailyUpdatesRepository as never,
        projectAccessService as never,
        sprintAccessService as never,
        tasksRepository as never,
        usersService as never,
        workspaceAccessService as never,
        shiftHandoversRepository as never,
      );
    };

    const buildParams = () => ({
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      targetUserId: 'user-1',
      reportDate: '2026-06-20',
    });

    it('tach ban giao da gui va ban giao da nhan theo nguoi dung', async () => {
      shiftHandoversRepository.findByProjectAndDate.mockResolvedValue([
        buildHandover({
          id: 'given-1',
          senderId: 'user-1',
          receiverId: 'user-2',
          status: HandoverStatus.Acknowledged,
          senderName: 'Nguyen Van A',
          receiverName: 'Tran Van B',
        }),
        buildHandover({
          id: 'received-1',
          senderId: 'user-3',
          receiverId: 'user-1',
          status: HandoverStatus.Pending,
          senderName: 'Le Van C',
          receiverName: 'Nguyen Van A',
        }),
      ]);

      const input = await buildService().buildPersonalDailyReportInput(
        buildParams(),
      );

      expect(input.handovers.given).toHaveLength(1);
      expect(input.handovers.given[0]).toMatchObject({
        id: 'given-1',
        taskCode: 'TASK-1',
        counterpartName: 'Tran Van B',
      });
      expect(input.handovers.received).toHaveLength(1);
      expect(input.handovers.received[0]).toMatchObject({
        id: 'received-1',
        counterpartName: 'Le Van C',
      });
    });

    it('dem so ban giao dang cho nguoi dung xu ly', async () => {
      shiftHandoversRepository.findPendingByReceiver.mockResolvedValue([
        buildHandover({
          id: 'pending-1',
          senderId: 'user-3',
          receiverId: 'user-1',
          status: HandoverStatus.Pending,
          senderName: 'Le Van C',
          receiverName: 'Nguyen Van A',
        }),
      ]);

      const input = await buildService().buildPersonalDailyReportInput(
        buildParams(),
      );

      expect(
        shiftHandoversRepository.findPendingByReceiver,
      ).toHaveBeenCalledWith('user-1', 'workspace-1');
      expect(input.handovers.pendingForMe).toBe(1);
    });

    it('tra ve danh sach rong khi trong ngay khong co ban giao', async () => {
      const input = await buildService().buildPersonalDailyReportInput(
        buildParams(),
      );

      expect(input.handovers).toEqual({
        given: [],
        received: [],
        pendingForMe: 0,
      });
    });
  });

  describe('Bao cao nhom', () => {
    const buildService = () => {
      const dailyUpdatesRepository = {
        findTeam: jest.fn().mockResolvedValue(emptyPage),
      };
      const projectAccessService = {
        assertProjectInWorkspace: jest.fn().mockResolvedValue({
          id: 'project-1',
          name: 'Du an A',
          keyCode: 'DAA',
          status: 'ACTIVE',
        }),
      };
      const sprintAccessService = { assertSprintInProject: jest.fn() };
      const tasksRepository = {
        findByProject: jest.fn().mockResolvedValue(emptyPage),
      };
      const workspaceAccessService = {
        assertWorkspaceActive: jest.fn().mockResolvedValue({
          id: 'workspace-1',
          name: 'Workspace',
          slug: 'workspace',
        }),
      };
      const workspaceMembersRepository = {
        findActiveByWorkspace: jest.fn().mockResolvedValue([]),
      };

      return new AiTeamReportDataBuilderService(
        dailyUpdatesRepository as never,
        projectAccessService as never,
        sprintAccessService as never,
        tasksRepository as never,
        workspaceAccessService as never,
        workspaceMembersRepository as never,
        shiftHandoversRepository as never,
      );
    };

    const buildParams = () => ({
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      reportDate: '2026-06-20',
    });

    it('dua ban giao cua ca doi vao du lieu bao cao', async () => {
      shiftHandoversRepository.findByProjectAndDate.mockResolvedValue([
        buildHandover({
          id: 'handover-1',
          senderId: 'user-1',
          receiverId: 'user-2',
          status: HandoverStatus.Acknowledged,
          senderName: 'Nguyen Van A',
          receiverName: 'Tran Van B',
        }),
      ]);

      const input = await buildService().buildTeamReportInput(buildParams());

      expect(
        shiftHandoversRepository.findByProjectAndDate,
      ).toHaveBeenCalledWith('project-1', '2026-06-20');
      expect(input.handovers).toHaveLength(1);
      expect(input.handovers[0]).toMatchObject({
        senderName: 'Nguyen Van A',
        receiverName: 'Tran Van B',
        taskCode: 'TASK-1',
      });
    });

    it('dem ban giao theo trang thai de lam ro diem tac nghen', async () => {
      shiftHandoversRepository.findByProjectAndDate.mockResolvedValue([
        buildHandover({
          id: 'h-1',
          senderId: 'user-1',
          receiverId: 'user-2',
          status: HandoverStatus.Acknowledged,
          senderName: 'A',
          receiverName: 'B',
        }),
        buildHandover({
          id: 'h-2',
          senderId: 'user-1',
          receiverId: 'user-3',
          status: HandoverStatus.Pending,
          senderName: 'A',
          receiverName: 'C',
        }),
        buildHandover({
          id: 'h-3',
          senderId: 'user-2',
          receiverId: 'user-3',
          status: HandoverStatus.ChangesRequested,
          senderName: 'B',
          receiverName: 'C',
        }),
        buildHandover({
          id: 'h-4',
          senderId: 'user-3',
          receiverId: 'user-1',
          status: HandoverStatus.Rejected,
          senderName: 'C',
          receiverName: 'A',
        }),
      ]);

      const input = await buildService().buildTeamReportInput(buildParams());

      expect(input.handoverStats).toEqual({
        total: 4,
        acknowledged: 1,
        pending: 1,
        changesRequested: 1,
        rejected: 1,
      });
    });

    it('tra ve thong ke rong khi khong co ban giao', async () => {
      const input = await buildService().buildTeamReportInput(buildParams());

      expect(input.handovers).toEqual([]);
      expect(input.handoverStats.total).toBe(0);
    });
  });
});
