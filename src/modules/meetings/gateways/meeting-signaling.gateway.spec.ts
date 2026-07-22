import { UserStatus } from '../../users/enums/user-status.enum';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingSignalingGateway } from './meeting-signaling.gateway';

type TestSocketUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

type TestClient = {
  id: string;
  data: {
    user?: TestSocketUser;
  };
  handshake: {
    auth: {
      token: string;
    };
    headers: Record<string, string>;
  };
  emit: jest.Mock;
  disconnect: jest.Mock;
  join: jest.Mock;
  leave: jest.Mock;
  to: jest.Mock;
  roomEmitter: {
    emit: jest.Mock;
  };
};

function createClient(id: string): TestClient {
  const roomEmitter = {
    emit: jest.fn(),
  };

  return {
    id,
    data: {},
    handshake: {
      auth: {
        token: 'access-token',
      },
      headers: {},
    },
    emit: jest.fn(),
    disconnect: jest.fn(),
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
    to: jest.fn(() => roomEmitter),
    roomEmitter,
  };
}

describe('MeetingSignalingGateway', () => {
  let gateway: MeetingSignalingGateway;
  let jwtService: { verifyAsync: jest.Mock };
  let usersService: { findById: jest.Mock };
  let meetingAccessService: {
    assertUserCanViewMeeting: jest.Mock;
    assertMeetingInProject: jest.Mock;
    isMeetingManager: jest.Mock;
  };
  let serverTarget: { emit: jest.Mock };

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-1',
        email: 'user@example.com',
      }),
    };
    usersService = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Nguyen Van A',
        avatarUrl: null,
        status: UserStatus.Active,
      }),
    };
    meetingAccessService = {
      assertUserCanViewMeeting: jest.fn().mockResolvedValue(undefined),
      assertMeetingInProject: jest.fn().mockResolvedValue({
        id: 'meeting-1',
        projectId: 'project-1',
        workspaceId: 'workspace-1',
        status: MeetingStatus.Scheduled,
        meetingDate: '2099-01-01',
        endTime: new Date('2099-01-01T09:00:00.000Z'),
      }),
      isMeetingManager: jest.fn().mockResolvedValue(true),
    };
    serverTarget = {
      emit: jest.fn(),
    };
    gateway = new MeetingSignalingGateway(
      jwtService as never,
      usersService as never,
      meetingAccessService as never,
    );
    (gateway as unknown as { server: { to: jest.Mock } }).server = {
      to: jest.fn(() => serverTarget),
    };
  });

  it('authenticates socket by access token', async () => {
    const client = createClient('socket-1');

    await gateway.handleConnection(client as never);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', {
      secret: process.env.JWT_ACCESS_SECRET ?? 'change_me_access_secret',
    });
    expect(client.data.user).toEqual({
      id: 'user-1',
      email: 'user@example.com',
      fullName: 'Nguyen Van A',
      avatarUrl: null,
    });
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('joins a meeting room and notifies existing participants', async () => {
    const client = createClient('socket-1');
    client.data.user = {
      id: 'user-1',
      email: 'user@example.com',
      fullName: 'Nguyen Van A',
      avatarUrl: null,
    };

    await gateway.joinMeeting(client as never, {
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      meetingId: 'meeting-1',
    });

    expect(meetingAccessService.assertUserCanViewMeeting).toHaveBeenCalledWith(
      'user-1',
      'workspace-1',
    );
    expect(client.join).toHaveBeenCalledWith('meeting:meeting-1');
    expect(client.emit).toHaveBeenCalledWith(
      'meeting-joined',
      expect.objectContaining({
        meetingId: 'meeting-1',
        participants: [],
      }),
    );
    expect(client.roomEmitter.emit).toHaveBeenCalledWith(
      'participant-joined',
      expect.objectContaining({
        socketId: 'socket-1',
        userId: 'user-1',
      }),
    );
  });

  it('authenticates during join when connection auth has not finished yet', async () => {
    const client = createClient('socket-1');

    await gateway.joinMeeting(client as never, {
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      meetingId: 'meeting-1',
    });

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', {
      secret: process.env.JWT_ACCESS_SECRET ?? 'change_me_access_secret',
    });
    expect(client.join).toHaveBeenCalledWith('meeting:meeting-1');
    expect(client.emit).toHaveBeenCalledWith(
      'meeting-joined',
      expect.objectContaining({
        meetingId: 'meeting-1',
      }),
    );
  });

  it('forwards WebRTC offer to a participant in the same room', async () => {
    const sender = createClient('socket-1');
    const target = createClient('socket-2');
    sender.data.user = {
      id: 'user-1',
      email: 'user@example.com',
      fullName: 'Nguyen Van A',
      avatarUrl: null,
    };
    target.data.user = {
      id: 'user-2',
      email: 'member@example.com',
      fullName: 'Tran Van B',
      avatarUrl: null,
    };

    await gateway.joinMeeting(sender as never, {
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      meetingId: 'meeting-1',
    });
    await gateway.joinMeeting(target as never, {
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      meetingId: 'meeting-1',
    });

    gateway.forwardOffer(sender as never, {
      toSocketId: 'socket-2',
      description: {
        type: 'offer',
        sdp: 'fake-sdp',
      },
    });

    expect(
      (gateway as unknown as { server: { to: jest.Mock } }).server.to,
    ).toHaveBeenCalledWith('socket-2');
    expect(serverTarget.emit).toHaveBeenCalledWith('webrtc-offer', {
      fromSocketId: 'socket-1',
      fromUserId: 'user-1',
      fromFullName: 'Nguyen Van A',
      description: {
        type: 'offer',
        sdp: 'fake-sdp',
      },
    });
  });

  it('keeps member in waiting room until owner admits them', async () => {
    const owner = createClient('socket-owner');
    const member = createClient('socket-member');
    owner.data.user = {
      id: 'owner-id',
      email: 'owner@example.com',
      fullName: 'Nguyen Van Owner',
      avatarUrl: null,
    };
    member.data.user = {
      id: 'member-id',
      email: 'member@example.com',
      fullName: 'Tran Van Member',
      avatarUrl: null,
    };
    meetingAccessService.isMeetingManager.mockImplementation((userId) =>
      Promise.resolve(userId === 'owner-id'),
    );

    await gateway.joinMeeting(owner as never, {
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      meetingId: 'meeting-1',
    });
    await gateway.joinMeeting(member as never, {
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      meetingId: 'meeting-1',
    });

    expect(member.join).not.toHaveBeenCalled();
    expect(member.emit).toHaveBeenCalledWith('join-request-pending', {
      message: 'Đang chờ chủ phòng cho phép vào phòng họp.',
    });
    expect(serverTarget.emit).toHaveBeenCalledWith(
      'join-requested',
      expect.objectContaining({
        socketId: 'socket-member',
        userId: 'member-id',
      }),
    );

    await gateway.admitParticipant(owner as never, {
      socketId: 'socket-member',
      approved: true,
    });

    expect(member.join).toHaveBeenCalledWith('meeting:meeting-1');
    expect(member.emit).toHaveBeenCalledWith(
      'meeting-joined',
      expect.objectContaining({
        meetingId: 'meeting-1',
      }),
    );
    expect(serverTarget.emit).toHaveBeenCalledWith('join-request-cancelled', {
      socketId: 'socket-member',
    });
  });

  it('rejects joining a meeting after its end time', async () => {
    const client = createClient('socket-1');
    client.data.user = {
      id: 'user-1',
      email: 'user@example.com',
      fullName: 'Nguyen Van A',
      avatarUrl: null,
    };
    meetingAccessService.assertMeetingInProject.mockResolvedValue({
      id: 'meeting-1',
      projectId: 'project-1',
      workspaceId: 'workspace-1',
      status: MeetingStatus.Scheduled,
      meetingDate: '2020-01-01',
      endTime: new Date('2020-01-01T09:00:00.000Z'),
    });

    await expect(
      gateway.joinMeeting(client as never, {
        workspaceId: 'workspace-1',
        projectId: 'project-1',
        meetingId: 'meeting-1',
      }),
    ).rejects.toThrow('Cuộc họp đã hết thời gian hoặc không còn mở.');
    expect(client.join).not.toHaveBeenCalled();
  });
});
