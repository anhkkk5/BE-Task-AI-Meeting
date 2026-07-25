import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { jwtConfig } from '../../../config/jwt.config';
import { UserStatus } from '../../users/enums/user-status.enum';
import { UsersService } from '../../users/services/users.service';
import type { JwtPayload } from '../../auth/types/jwt-payload.type';
import { MeetingStatus } from '../../../common/enums/meeting-status.enum';
import { MeetingAccessService } from '../services/meeting-access.service';
import { MeetingsService } from '../services/meetings.service';

type SignalingUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

type AuthenticatedSocket = Socket & {
  data: {
    user?: SignalingUser;
    meetingId?: string;
  };
};

type JoinMeetingPayload = {
  workspaceId?: string;
  projectId?: string;
  meetingId?: string;
};

type SignalPayload = {
  to?: string;
  toSocketId?: string;
  targetSocketId?: string;
  description?: Record<string, unknown>;
  candidate?: Record<string, unknown>;
};

type MediaStatePayload = {
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  screenSharing?: boolean;
};

type ParticipantState = {
  socketId: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  joinedAt: string;
  canManage: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
};

type WaitingParticipant = {
  client: AuthenticatedSocket;
  meetingId: string;
  workspaceId: string;
  projectId: string;
  requestedAt: string;
  user: SignalingUser;
};

type AdmitParticipantPayload = {
  socketId?: string;
  approved?: boolean;
  reason?: string;
};

@WebSocketGateway({
  namespace: 'meetings',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class MeetingSignalingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger(MeetingSignalingGateway.name);
  private readonly rooms = new Map<string, Map<string, ParticipantState>>();
  private readonly waitingRooms = new Map<
    string,
    Map<string, WaitingParticipant>
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly meetingAccessService: MeetingAccessService,
    private readonly meetingsService: MeetingsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      client.data.user = await this.authenticate(client);
    } catch (error) {
      client.emit('meeting-error', {
        message:
          error instanceof Error
            ? error.message
            : 'Socket authentication failed',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.leaveCurrentMeeting(client);
  }

  @SubscribeMessage('join-meeting')
  async joinMeeting(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinMeetingPayload,
  ) {
    const user = await this.ensureSocketUser(client);
    const { workspaceId, projectId, meetingId } =
      this.validateJoinPayload(payload);

    await this.meetingAccessService.assertUserCanViewMeeting(
      user.id,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );

    if (meeting.workspaceId !== workspaceId) {
      throw new WsException('Meeting does not belong to this workspace');
    }

    if (!this.isMeetingJoinable(meeting)) {
      throw new WsException('Cuộc họp đã hết thời gian hoặc không còn mở.');
    }

    this.leaveCurrentMeeting(client);

    const roomKey = this.getRoomKey(meetingId);
    const canManage = await this.meetingAccessService.isMeetingManager(
      user.id,
      workspaceId,
    );

    if (!canManage) {
      this.addWaitingParticipant(client, {
        meetingId,
        workspaceId,
        projectId,
        requestedAt: new Date().toISOString(),
        user,
      });

      return;
    }

    const participant = await this.addParticipantToRoom(
      client,
      meetingId,
      projectId,
      roomKey,
      canManage,
    );

    client.emit('join-requests', {
      items: this.getWaitingParticipants(roomKey),
    });
    client.to(roomKey).emit('participant-joined', participant);
  }

  @SubscribeMessage('admit-participant')
  async admitParticipant(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: AdmitParticipantPayload,
  ) {
    const roomKey = this.getCurrentRoomKey(client);
    const room = this.rooms.get(roomKey);
    const approver = room?.get(client.id);

    if (!approver?.canManage) {
      throw new WsException('Only meeting owner or manager can admit users');
    }

    const targetSocketId = payload.socketId?.trim();

    if (!targetSocketId) {
      throw new WsException('socketId is required');
    }

    const waitingRoom = this.waitingRooms.get(roomKey);
    const waiting = waitingRoom?.get(targetSocketId);

    if (!waiting) {
      throw new WsException('Join request not found');
    }

    waitingRoom?.delete(targetSocketId);

    if (!waitingRoom?.size) {
      this.waitingRooms.delete(roomKey);
    }

    if (payload.approved === false) {
      waiting.client.emit('join-request-denied', {
        message: payload.reason || 'Chủ phòng đã từ chối cho vào phòng họp.',
      });
      this.emitJoinRequestCancelled(roomKey, targetSocketId);
      return;
    }

    const meeting = await this.meetingAccessService.assertMeetingInProject(
      waiting.meetingId,
      waiting.projectId,
    );

    if (!this.isMeetingJoinable(meeting)) {
      waiting.client.emit('join-request-denied', {
        message: 'Cuộc họp đã hết thời gian hoặc không còn mở.',
      });
      this.emitJoinRequestCancelled(roomKey, targetSocketId);
      return;
    }

    const participant = await this.addParticipantToRoom(
      waiting.client,
      waiting.meetingId,
      waiting.projectId,
      roomKey,
      false,
    );

    waiting.client.emit('join-request-approved', {
      meetingId: waiting.meetingId,
    });
    waiting.client.to(roomKey).emit('participant-joined', participant);
    this.emitJoinRequestCancelled(roomKey, targetSocketId);
  }

  private async addParticipantToRoom(
    client: AuthenticatedSocket,
    meetingId: string,
    projectId: string,
    roomKey: string,
    canManage: boolean,
  ) {
    const user = this.getSocketUser(client);
    const room = this.getOrCreateRoom(roomKey);
    const participant: ParticipantState = {
      socketId: client.id,
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      joinedAt: new Date().toISOString(),
      canManage,
      audioEnabled: true,
      videoEnabled: true,
      screenSharing: false,
    };
    const existingParticipants = [...room.values()];

    await client.join(roomKey);
    room.set(client.id, participant);
    client.data.meetingId = meetingId;

    client.emit('meeting-joined', {
      meetingId,
      self: participant,
      participants: existingParticipants,
    });
    await this.markMeetingStarted(meetingId, projectId, roomKey);

    return participant;
  }

  /**
   * Danh dau cuoc hop da bat dau khi nguoi dau tien vao phong.
   * Loi o day chi ghi log: khong duoc lam that bai viec vao phong hop.
   */
  private async markMeetingStarted(
    meetingId: string,
    projectId: string,
    roomKey: string,
  ) {
    try {
      const started = await this.meetingsService.markMeetingInProgress(
        projectId,
        meetingId,
      );

      if (started) {
        this.server.to(roomKey).emit('meeting-status-changed', {
          meetingId,
          status: MeetingStatus.InProgress,
        });
        this.logger.log(`Cuoc hop ${meetingId} da bat dau`);
      }
    } catch (error) {
      this.logger.error(
        `Khong the danh dau cuoc hop ${meetingId} dang dien ra`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  @SubscribeMessage('leave-meeting')
  leaveMeeting(@ConnectedSocket() client: AuthenticatedSocket) {
    this.leaveCurrentMeeting(client);
  }

  @SubscribeMessage('webrtc-offer')
  forwardOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SignalPayload,
  ) {
    this.forwardSignal(client, payload, 'webrtc-offer', 'description');
  }

  @SubscribeMessage('webrtc-answer')
  forwardAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SignalPayload,
  ) {
    this.forwardSignal(client, payload, 'webrtc-answer', 'description');
  }

  @SubscribeMessage('webrtc-ice-candidate')
  forwardIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SignalPayload,
  ) {
    this.forwardSignal(client, payload, 'webrtc-ice-candidate', 'candidate');
  }

  @SubscribeMessage('media-state')
  updateMediaState(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: MediaStatePayload,
  ) {
    const roomKey = this.getCurrentRoomKey(client);
    const participant = this.rooms.get(roomKey)?.get(client.id);

    if (!participant) {
      throw new WsException('You have not joined this meeting');
    }

    participant.audioEnabled =
      typeof payload.audioEnabled === 'boolean'
        ? payload.audioEnabled
        : participant.audioEnabled;
    participant.videoEnabled =
      typeof payload.videoEnabled === 'boolean'
        ? payload.videoEnabled
        : participant.videoEnabled;
    participant.screenSharing =
      typeof payload.screenSharing === 'boolean'
        ? payload.screenSharing
        : participant.screenSharing;

    client.to(roomKey).emit('participant-media-state', participant);
  }

  private addWaitingParticipant(
    client: AuthenticatedSocket,
    waiting: Omit<WaitingParticipant, 'client'>,
  ) {
    const roomKey = this.getRoomKey(waiting.meetingId);
    const waitingRoom = this.getOrCreateWaitingRoom(roomKey);
    const item: WaitingParticipant = {
      ...waiting,
      client,
    };

    client.data.meetingId = undefined;
    waitingRoom.set(client.id, item);

    client.emit('join-request-pending', {
      message: 'Đang chờ chủ phòng cho phép vào phòng họp.',
    });
    this.emitJoinRequested(roomKey, item);
  }

  private async authenticate(client: Socket): Promise<SignalingUser> {
    const token = this.extractAccessToken(client);

    if (!token) {
      throw new WsException('Missing access token');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: jwtConfig().accessSecret,
    });
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.status !== UserStatus.Active) {
      throw new WsException('Invalid access token');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    };
  }

  private async ensureSocketUser(client: AuthenticatedSocket) {
    if (!client.data.user) {
      client.data.user = await this.authenticate(client);
    }

    return client.data.user;
  }

  private extractAccessToken(client: Socket) {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.trim();
    }

    const header = client.handshake.headers.authorization;

    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7).trim();
    }

    return '';
  }

  private getSocketUser(client: AuthenticatedSocket) {
    if (!client.data.user) {
      throw new WsException('Socket is not authenticated');
    }

    return client.data.user;
  }

  private validateJoinPayload(payload: JoinMeetingPayload) {
    const workspaceId = payload.workspaceId?.trim();
    const projectId = payload.projectId?.trim();
    const meetingId = payload.meetingId?.trim();

    if (!workspaceId || !projectId || !meetingId) {
      throw new WsException(
        'workspaceId, projectId and meetingId are required',
      );
    }

    return { workspaceId, projectId, meetingId };
  }

  private isMeetingJoinable(meeting: {
    status?: MeetingStatus | string;
    endTime?: Date | string | null;
    meetingDate?: string;
  }) {
    // IN_PROGRESS phai duoc vao: nguoi bi mat ket noi giua buoi hop can vao lai.
    // Chi khi cuoc hop duoc chot (COMPLETED) thi phong moi that su dong.
    const openStatuses: string[] = [
      MeetingStatus.Scheduled,
      MeetingStatus.InProgress,
    ];

    if (!meeting.status || !openStatuses.includes(meeting.status)) {
      return false;
    }

    const endTime = meeting.endTime
      ? new Date(meeting.endTime).getTime()
      : meeting.meetingDate
        ? new Date(`${meeting.meetingDate}T23:59:59`).getTime()
        : NaN;

    return Number.isFinite(endTime) && endTime >= Date.now();
  }

  private forwardSignal(
    client: AuthenticatedSocket,
    payload: SignalPayload,
    eventName: 'webrtc-offer' | 'webrtc-answer' | 'webrtc-ice-candidate',
    signalKey: 'description' | 'candidate',
  ) {
    const roomKey = this.getCurrentRoomKey(client);
    const room = this.rooms.get(roomKey);
    const targetSocketId =
      payload.toSocketId ?? payload.targetSocketId ?? payload.to;
    const signal = payload[signalKey];

    if (!targetSocketId || !signal) {
      throw new WsException('Target socket and signal payload are required');
    }

    if (!room?.has(client.id) || !room.has(targetSocketId)) {
      throw new WsException('Target participant is not in this meeting');
    }

    const sender = room.get(client.id);

    this.server.to(targetSocketId).emit(eventName, {
      fromSocketId: client.id,
      fromUserId: sender?.userId,
      fromFullName: sender?.fullName,
      [signalKey]: signal,
    });
  }

  private leaveCurrentMeeting(client: AuthenticatedSocket) {
    this.removeWaitingParticipant(client);

    const meetingId = client.data.meetingId;

    if (!meetingId) {
      return;
    }

    const roomKey = this.getRoomKey(meetingId);
    const room = this.rooms.get(roomKey);
    const participant = room?.get(client.id);

    if (!room || !participant) {
      client.data.meetingId = undefined;
      return;
    }

    room.delete(client.id);
    void client.leave(roomKey);
    client.data.meetingId = undefined;

    client.to(roomKey).emit('participant-left', {
      socketId: client.id,
      userId: participant.userId,
    });

    if (room.size === 0) {
      this.rooms.delete(roomKey);
    }

    this.logger.debug(
      `Socket ${client.id} left meeting ${meetingId}. Online: ${room.size}`,
    );
  }

  private removeWaitingParticipant(client: AuthenticatedSocket) {
    for (const [roomKey, waitingRoom] of this.waitingRooms.entries()) {
      if (!waitingRoom.has(client.id)) {
        continue;
      }

      waitingRoom.delete(client.id);

      if (!waitingRoom.size) {
        this.waitingRooms.delete(roomKey);
      }

      this.emitJoinRequestCancelled(roomKey, client.id);
      return;
    }
  }

  private getCurrentRoomKey(client: AuthenticatedSocket) {
    if (!client.data.meetingId) {
      throw new WsException('You have not joined this meeting');
    }

    return this.getRoomKey(client.data.meetingId);
  }

  private getOrCreateRoom(roomKey: string) {
    const existingRoom = this.rooms.get(roomKey);

    if (existingRoom) {
      return existingRoom;
    }

    const room = new Map<string, ParticipantState>();
    this.rooms.set(roomKey, room);
    return room;
  }

  private getOrCreateWaitingRoom(roomKey: string) {
    const existingRoom = this.waitingRooms.get(roomKey);

    if (existingRoom) {
      return existingRoom;
    }

    const waitingRoom = new Map<string, WaitingParticipant>();
    this.waitingRooms.set(roomKey, waitingRoom);
    return waitingRoom;
  }

  private getWaitingParticipants(roomKey: string) {
    return [...(this.waitingRooms.get(roomKey)?.values() ?? [])].map((item) =>
      this.toJoinRequest(item),
    );
  }

  private emitJoinRequested(roomKey: string, item: WaitingParticipant) {
    this.server.to(roomKey).emit('join-requested', this.toJoinRequest(item));
  }

  private emitJoinRequestCancelled(roomKey: string, socketId: string) {
    this.server.to(roomKey).emit('join-request-cancelled', {
      socketId,
    });
  }

  private toJoinRequest(item: WaitingParticipant) {
    return {
      socketId: item.client.id,
      userId: item.user.id,
      email: item.user.email,
      fullName: item.user.fullName,
      avatarUrl: item.user.avatarUrl,
      requestedAt: item.requestedAt,
    };
  }

  private getRoomKey(meetingId: string) {
    return `meeting:${meetingId}`;
  }
}
