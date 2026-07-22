import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../../users/services/users.service';
import { MeetingAccessService } from '../services/meeting-access.service';
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
type AdmitParticipantPayload = {
    socketId?: string;
    approved?: boolean;
    reason?: string;
};
export declare class MeetingSignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly usersService;
    private readonly meetingAccessService;
    private readonly server;
    private readonly logger;
    private readonly rooms;
    private readonly waitingRooms;
    constructor(jwtService: JwtService, usersService: UsersService, meetingAccessService: MeetingAccessService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    joinMeeting(client: AuthenticatedSocket, payload: JoinMeetingPayload): Promise<void>;
    admitParticipant(client: AuthenticatedSocket, payload: AdmitParticipantPayload): Promise<void>;
    private addParticipantToRoom;
    leaveMeeting(client: AuthenticatedSocket): void;
    forwardOffer(client: AuthenticatedSocket, payload: SignalPayload): void;
    forwardAnswer(client: AuthenticatedSocket, payload: SignalPayload): void;
    forwardIceCandidate(client: AuthenticatedSocket, payload: SignalPayload): void;
    updateMediaState(client: AuthenticatedSocket, payload: MediaStatePayload): void;
    private addWaitingParticipant;
    private authenticate;
    private ensureSocketUser;
    private extractAccessToken;
    private getSocketUser;
    private validateJoinPayload;
    private isMeetingJoinable;
    private forwardSignal;
    private leaveCurrentMeeting;
    private removeWaitingParticipant;
    private getCurrentRoomKey;
    private getOrCreateRoom;
    private getOrCreateWaitingRoom;
    private getWaitingParticipants;
    private emitJoinRequested;
    private emitJoinRequestCancelled;
    private toJoinRequest;
    private getRoomKey;
}
export {};
