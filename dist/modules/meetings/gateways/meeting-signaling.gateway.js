"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MeetingSignalingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingSignalingGateway = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_config_1 = require("../../../config/jwt.config");
const user_status_enum_1 = require("../../users/enums/user-status.enum");
const users_service_1 = require("../../users/services/users.service");
const meeting_status_enum_1 = require("../../../common/enums/meeting-status.enum");
const meeting_access_service_1 = require("../services/meeting-access.service");
const meetings_service_1 = require("../services/meetings.service");
let MeetingSignalingGateway = MeetingSignalingGateway_1 = class MeetingSignalingGateway {
    jwtService;
    usersService;
    meetingAccessService;
    meetingsService;
    server;
    logger = new common_1.Logger(MeetingSignalingGateway_1.name);
    rooms = new Map();
    waitingRooms = new Map();
    constructor(jwtService, usersService, meetingAccessService, meetingsService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.meetingAccessService = meetingAccessService;
        this.meetingsService = meetingsService;
    }
    async handleConnection(client) {
        try {
            client.data.user = await this.authenticate(client);
        }
        catch (error) {
            client.emit('meeting-error', {
                message: error instanceof Error
                    ? error.message
                    : 'Socket authentication failed',
            });
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.leaveCurrentMeeting(client);
    }
    async joinMeeting(client, payload) {
        const user = await this.ensureSocketUser(client);
        const { workspaceId, projectId, meetingId } = this.validateJoinPayload(payload);
        await this.meetingAccessService.assertUserCanViewMeeting(user.id, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        if (meeting.workspaceId !== workspaceId) {
            throw new websockets_1.WsException('Meeting does not belong to this workspace');
        }
        if (!this.isMeetingJoinable(meeting)) {
            throw new websockets_1.WsException('Cuộc họp đã hết thời gian hoặc không còn mở.');
        }
        this.leaveCurrentMeeting(client);
        const roomKey = this.getRoomKey(meetingId);
        const canManage = await this.meetingAccessService.isMeetingManager(user.id, workspaceId);
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
        const participant = await this.addParticipantToRoom(client, meetingId, projectId, roomKey, canManage);
        client.emit('join-requests', {
            items: this.getWaitingParticipants(roomKey),
        });
        client.to(roomKey).emit('participant-joined', participant);
    }
    async admitParticipant(client, payload) {
        const roomKey = this.getCurrentRoomKey(client);
        const room = this.rooms.get(roomKey);
        const approver = room?.get(client.id);
        if (!approver?.canManage) {
            throw new websockets_1.WsException('Only meeting owner or manager can admit users');
        }
        const targetSocketId = payload.socketId?.trim();
        if (!targetSocketId) {
            throw new websockets_1.WsException('socketId is required');
        }
        const waitingRoom = this.waitingRooms.get(roomKey);
        const waiting = waitingRoom?.get(targetSocketId);
        if (!waiting) {
            throw new websockets_1.WsException('Join request not found');
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
        const meeting = await this.meetingAccessService.assertMeetingInProject(waiting.meetingId, waiting.projectId);
        if (!this.isMeetingJoinable(meeting)) {
            waiting.client.emit('join-request-denied', {
                message: 'Cuộc họp đã hết thời gian hoặc không còn mở.',
            });
            this.emitJoinRequestCancelled(roomKey, targetSocketId);
            return;
        }
        const participant = await this.addParticipantToRoom(waiting.client, waiting.meetingId, waiting.projectId, roomKey, false);
        waiting.client.emit('join-request-approved', {
            meetingId: waiting.meetingId,
        });
        waiting.client.to(roomKey).emit('participant-joined', participant);
        this.emitJoinRequestCancelled(roomKey, targetSocketId);
    }
    async addParticipantToRoom(client, meetingId, projectId, roomKey, canManage) {
        const user = this.getSocketUser(client);
        const room = this.getOrCreateRoom(roomKey);
        const participant = {
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
    async markMeetingStarted(meetingId, projectId, roomKey) {
        try {
            const started = await this.meetingsService.markMeetingInProgress(projectId, meetingId);
            if (started) {
                this.server.to(roomKey).emit('meeting-status-changed', {
                    meetingId,
                    status: meeting_status_enum_1.MeetingStatus.InProgress,
                });
                this.logger.log(`Cuoc hop ${meetingId} da bat dau`);
            }
        }
        catch (error) {
            this.logger.error(`Khong the danh dau cuoc hop ${meetingId} dang dien ra`, error instanceof Error ? error.stack : String(error));
        }
    }
    leaveMeeting(client) {
        this.leaveCurrentMeeting(client);
    }
    forwardOffer(client, payload) {
        this.forwardSignal(client, payload, 'webrtc-offer', 'description');
    }
    forwardAnswer(client, payload) {
        this.forwardSignal(client, payload, 'webrtc-answer', 'description');
    }
    forwardIceCandidate(client, payload) {
        this.forwardSignal(client, payload, 'webrtc-ice-candidate', 'candidate');
    }
    updateMediaState(client, payload) {
        const roomKey = this.getCurrentRoomKey(client);
        const participant = this.rooms.get(roomKey)?.get(client.id);
        if (!participant) {
            throw new websockets_1.WsException('You have not joined this meeting');
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
    addWaitingParticipant(client, waiting) {
        const roomKey = this.getRoomKey(waiting.meetingId);
        const waitingRoom = this.getOrCreateWaitingRoom(roomKey);
        const item = {
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
    async authenticate(client) {
        const token = this.extractAccessToken(client);
        if (!token) {
            throw new websockets_1.WsException('Missing access token');
        }
        const payload = await this.jwtService.verifyAsync(token, {
            secret: (0, jwt_config_1.jwtConfig)().accessSecret,
        });
        const user = await this.usersService.findById(payload.sub);
        if (!user || user.status !== user_status_enum_1.UserStatus.Active) {
            throw new websockets_1.WsException('Invalid access token');
        }
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
        };
    }
    async ensureSocketUser(client) {
        if (!client.data.user) {
            client.data.user = await this.authenticate(client);
        }
        return client.data.user;
    }
    extractAccessToken(client) {
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
    getSocketUser(client) {
        if (!client.data.user) {
            throw new websockets_1.WsException('Socket is not authenticated');
        }
        return client.data.user;
    }
    validateJoinPayload(payload) {
        const workspaceId = payload.workspaceId?.trim();
        const projectId = payload.projectId?.trim();
        const meetingId = payload.meetingId?.trim();
        if (!workspaceId || !projectId || !meetingId) {
            throw new websockets_1.WsException('workspaceId, projectId and meetingId are required');
        }
        return { workspaceId, projectId, meetingId };
    }
    isMeetingJoinable(meeting) {
        const openStatuses = [
            meeting_status_enum_1.MeetingStatus.Scheduled,
            meeting_status_enum_1.MeetingStatus.InProgress,
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
    forwardSignal(client, payload, eventName, signalKey) {
        const roomKey = this.getCurrentRoomKey(client);
        const room = this.rooms.get(roomKey);
        const targetSocketId = payload.toSocketId ?? payload.targetSocketId ?? payload.to;
        const signal = payload[signalKey];
        if (!targetSocketId || !signal) {
            throw new websockets_1.WsException('Target socket and signal payload are required');
        }
        if (!room?.has(client.id) || !room.has(targetSocketId)) {
            throw new websockets_1.WsException('Target participant is not in this meeting');
        }
        const sender = room.get(client.id);
        this.server.to(targetSocketId).emit(eventName, {
            fromSocketId: client.id,
            fromUserId: sender?.userId,
            fromFullName: sender?.fullName,
            [signalKey]: signal,
        });
    }
    leaveCurrentMeeting(client) {
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
        this.logger.debug(`Socket ${client.id} left meeting ${meetingId}. Online: ${room.size}`);
    }
    removeWaitingParticipant(client) {
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
    getCurrentRoomKey(client) {
        if (!client.data.meetingId) {
            throw new websockets_1.WsException('You have not joined this meeting');
        }
        return this.getRoomKey(client.data.meetingId);
    }
    getOrCreateRoom(roomKey) {
        const existingRoom = this.rooms.get(roomKey);
        if (existingRoom) {
            return existingRoom;
        }
        const room = new Map();
        this.rooms.set(roomKey, room);
        return room;
    }
    getOrCreateWaitingRoom(roomKey) {
        const existingRoom = this.waitingRooms.get(roomKey);
        if (existingRoom) {
            return existingRoom;
        }
        const waitingRoom = new Map();
        this.waitingRooms.set(roomKey, waitingRoom);
        return waitingRoom;
    }
    getWaitingParticipants(roomKey) {
        return [...(this.waitingRooms.get(roomKey)?.values() ?? [])].map((item) => this.toJoinRequest(item));
    }
    emitJoinRequested(roomKey, item) {
        this.server.to(roomKey).emit('join-requested', this.toJoinRequest(item));
    }
    emitJoinRequestCancelled(roomKey, socketId) {
        this.server.to(roomKey).emit('join-request-cancelled', {
            socketId,
        });
    }
    toJoinRequest(item) {
        return {
            socketId: item.client.id,
            userId: item.user.id,
            email: item.user.email,
            fullName: item.user.fullName,
            avatarUrl: item.user.avatarUrl,
            requestedAt: item.requestedAt,
        };
    }
    getRoomKey(meetingId) {
        return `meeting:${meetingId}`;
    }
};
exports.MeetingSignalingGateway = MeetingSignalingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MeetingSignalingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-meeting'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MeetingSignalingGateway.prototype, "joinMeeting", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('admit-participant'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MeetingSignalingGateway.prototype, "admitParticipant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-meeting'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MeetingSignalingGateway.prototype, "leaveMeeting", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc-offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MeetingSignalingGateway.prototype, "forwardOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc-answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MeetingSignalingGateway.prototype, "forwardAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc-ice-candidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MeetingSignalingGateway.prototype, "forwardIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('media-state'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MeetingSignalingGateway.prototype, "updateMediaState", null);
exports.MeetingSignalingGateway = MeetingSignalingGateway = MeetingSignalingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'meetings',
        cors: {
            origin: true,
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        meeting_access_service_1.MeetingAccessService,
        meetings_service_1.MeetingsService])
], MeetingSignalingGateway);
//# sourceMappingURL=meeting-signaling.gateway.js.map