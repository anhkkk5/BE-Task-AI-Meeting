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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingParticipantsService = void 0;
const common_1 = require("@nestjs/common");
const meeting_participant_role_enum_1 = require("../../../common/enums/meeting-participant-role.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const project_access_service_1 = require("../../projects/services/project-access.service");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const notifications_service_1 = require("../../notifications/notifications.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const meeting_participants_repository_1 = require("../repositories/meeting-participants.repository");
const meeting_access_service_1 = require("./meeting-access.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let MeetingParticipantsService = class MeetingParticipantsService {
    meetingParticipantsRepository;
    meetingAccessService;
    workspaceAccessService;
    projectAccessService;
    notificationsService;
    constructor(meetingParticipantsRepository, meetingAccessService, workspaceAccessService, projectAccessService, notificationsService) {
        this.meetingParticipantsRepository = meetingParticipantsRepository;
        this.meetingAccessService = meetingAccessService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
        this.notificationsService = notificationsService;
    }
    async addParticipants(currentUserId, workspaceId, projectId, meetingId, dto) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.meetingAccessService.assertUserCanManageMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        this.meetingAccessService.assertMeetingEditable(meeting);
        const uniqueParticipants = this.deduplicateParticipants(dto.participants);
        await this.assertParticipantsInWorkspace(uniqueParticipants.map((participant) => participant.userId), workspaceId);
        const existingParticipants = await this.meetingParticipantsRepository.findByMeetingAndUsers(meetingId, uniqueParticipants.map((participant) => participant.userId));
        if (existingParticipants.length) {
            throw new common_1.ConflictException('User is already a participant of this meeting');
        }
        const participants = await this.meetingParticipantsRepository.createMany(uniqueParticipants.map((participant) => ({
            meetingId,
            userId: participant.userId,
            role: participant.role ?? meeting_participant_role_enum_1.MeetingParticipantRole.Participant,
        })));
        if (this.notificationsService) {
            await Promise.all(uniqueParticipants
                .filter((participant) => participant.userId !== currentUserId)
                .map((participant) => this.notificationsService.create({
                recipientId: participant.userId,
                type: notification_entity_1.NotificationType.MeetingInvited,
                title: 'Bạn được mời tham gia cuộc họp',
                body: `${meeting.title} - Ngày: ${meeting.meetingDate}`,
                link: `/workspaces/${workspaceId}/projects/${projectId}/meetings/${meetingId}`,
                metadata: { meetingId, workspaceId, projectId },
            })));
        }
        return {
            success: true,
            message: 'Add meeting participants successfully',
            data: {
                items: participants.map((participant) => this.toParticipantResponse(participant)),
            },
        };
    }
    async getParticipants(currentUserId, workspaceId, projectId, meetingId) {
        await this.meetingAccessService.assertUserCanViewMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        const participants = await this.meetingParticipantsRepository.findByMeeting(meetingId);
        return {
            success: true,
            message: 'Get meeting participants successfully',
            data: {
                items: participants.map((participant) => this.toParticipantResponse(participant)),
            },
        };
    }
    async updateAttendance(currentUserId, workspaceId, projectId, meetingId, participantId, dto) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        const participant = await this.assertParticipantInMeeting(participantId, meetingId);
        await this.assertCanUpdateAttendance(currentUserId, workspaceId, participant);
        const updatedParticipant = await this.meetingParticipantsRepository.update(participant, {
            attended: dto.attended,
        });
        return {
            success: true,
            message: 'Update participant attendance successfully',
            data: {
                participant: this.toParticipantResponse(updatedParticipant),
            },
        };
    }
    async assertParticipantInMeeting(participantId, meetingId) {
        const participant = await this.meetingParticipantsRepository.findByIdAndMeeting(participantId, meetingId);
        if (!participant) {
            throw new common_1.NotFoundException('Meeting participant not found');
        }
        return participant;
    }
    async assertCanUpdateAttendance(currentUserId, workspaceId, participant) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(currentUserId, workspaceId);
        if (role && managerRoles.includes(role)) {
            return;
        }
        if (role === workspace_role_enum_1.WorkspaceRole.Member && participant.userId === currentUserId) {
            return;
        }
        throw new common_1.ForbiddenException('You can not update this attendance');
    }
    async assertParticipantsInWorkspace(userIds, workspaceId) {
        for (const userId of userIds) {
            try {
                await this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
            }
            catch {
                throw new common_1.BadRequestException('Participant is not an active member of this workspace');
            }
        }
    }
    deduplicateParticipants(participants) {
        const map = new Map();
        participants.forEach((participant) => {
            if (!map.has(participant.userId)) {
                map.set(participant.userId, participant);
            }
        });
        return [...map.values()];
    }
    toParticipantResponse(participant) {
        return {
            participantId: participant.id,
            userId: participant.userId,
            fullName: participant.user?.fullName ?? null,
            email: participant.user?.email ?? null,
            avatarUrl: participant.user?.avatarUrl ?? null,
            role: participant.role,
            attended: participant.attended,
        };
    }
};
exports.MeetingParticipantsService = MeetingParticipantsService;
exports.MeetingParticipantsService = MeetingParticipantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [meeting_participants_repository_1.MeetingParticipantsRepository,
        meeting_access_service_1.MeetingAccessService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService,
        notifications_service_1.NotificationsService])
], MeetingParticipantsService);
//# sourceMappingURL=meeting-participants.service.js.map