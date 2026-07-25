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
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meeting_participant_role_enum_1 = require("../../../common/enums/meeting-participant-role.enum");
const meeting_status_enum_1 = require("../../../common/enums/meeting-status.enum");
const meeting_type_enum_1 = require("../../../common/enums/meeting-type.enum");
const project_access_service_1 = require("../../projects/services/project-access.service");
const sprint_access_service_1 = require("../../sprints/services/sprint-access.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const meeting_participants_repository_1 = require("../repositories/meeting-participants.repository");
const meetings_repository_1 = require("../repositories/meetings.repository");
const meeting_access_service_1 = require("./meeting-access.service");
const meeting_lifecycle_service_1 = require("./meeting-lifecycle.service");
let MeetingsService = class MeetingsService {
    dataSource;
    meetingsRepository;
    meetingParticipantsRepository;
    meetingAccessService;
    workspaceAccessService;
    projectAccessService;
    sprintAccessService;
    meetingLifecycleService;
    constructor(dataSource, meetingsRepository, meetingParticipantsRepository, meetingAccessService, workspaceAccessService, projectAccessService, sprintAccessService, meetingLifecycleService) {
        this.dataSource = dataSource;
        this.meetingsRepository = meetingsRepository;
        this.meetingParticipantsRepository = meetingParticipantsRepository;
        this.meetingAccessService = meetingAccessService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
        this.sprintAccessService = sprintAccessService;
        this.meetingLifecycleService = meetingLifecycleService;
    }
    async createMeeting(currentUserId, workspaceId, projectId, dto) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.meetingAccessService.assertUserCanManageMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectActive(projectId, workspaceId);
        await this.assertSprintFilter(projectId, dto.sprintId ?? undefined);
        this.assertTimeRange(dto.startTime, dto.endTime);
        const participantIds = this.uniqueUserIds([
            currentUserId,
            ...(dto.participantIds ?? []),
        ]);
        await this.assertParticipantsInWorkspace(participantIds, workspaceId);
        const meeting = await this.dataSource.transaction(async (manager) => {
            const createdMeeting = await this.meetingsRepository.create({
                workspaceId,
                projectId,
                sprintId: dto.sprintId ?? null,
                title: dto.title.trim(),
                description: this.optionalText(dto.description),
                meetingType: dto.meetingType ?? meeting_type_enum_1.MeetingType.General,
                meetingDate: this.normalizeDate(dto.meetingDate),
                startTime: this.toDateOrNull(dto.startTime),
                endTime: this.toDateOrNull(dto.endTime),
                createdBy: currentUserId,
            }, manager);
            await this.meetingParticipantsRepository.createMany(participantIds.map((userId) => ({
                attended: userId === currentUserId,
                meetingId: createdMeeting.id,
                role: userId === currentUserId
                    ? meeting_participant_role_enum_1.MeetingParticipantRole.Host
                    : meeting_participant_role_enum_1.MeetingParticipantRole.Participant,
                userId,
            })), manager);
            return createdMeeting;
        });
        const meetingWithParticipants = await this.meetingsRepository.findByIdAndProject(meeting.id, projectId);
        return {
            success: true,
            message: 'Create meeting successfully',
            data: {
                meeting: this.toMeetingResponse(meetingWithParticipants ?? meeting),
            },
        };
    }
    async getMeetings(currentUserId, workspaceId, projectId, query) {
        await this.meetingAccessService.assertUserCanViewMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.assertValidMeetingFilters(projectId, query);
        const result = await this.meetingsRepository.findByProject(projectId, query);
        return {
            success: true,
            message: 'Get meetings successfully',
            data: {
                items: result.items.map((meeting) => this.toMeetingResponse(meeting)),
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                },
            },
        };
    }
    async getMeetingDetail(currentUserId, workspaceId, projectId, meetingId) {
        await this.meetingAccessService.assertUserCanViewMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        return {
            success: true,
            message: 'Get meeting detail successfully',
            data: {
                meeting: this.toMeetingResponse(meeting),
            },
        };
    }
    async updateMeeting(currentUserId, workspaceId, projectId, meetingId, dto) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.meetingAccessService.assertUserCanManageMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectActive(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        this.meetingAccessService.assertMeetingEditable(meeting);
        await this.assertSprintFilter(projectId, dto.sprintId ?? undefined);
        this.assertTimeRange(dto.startTime === undefined
            ? meeting.startTime?.toISOString()
            : dto.startTime, dto.endTime === undefined ? meeting.endTime?.toISOString() : dto.endTime);
        const updatedMeeting = await this.meetingsRepository.update(meeting, {
            sprintId: dto.sprintId === undefined ? meeting.sprintId : dto.sprintId,
            title: dto.title === undefined ? meeting.title : dto.title.trim(),
            description: dto.description === undefined
                ? meeting.description
                : this.optionalText(dto.description),
            meetingType: dto.meetingType ?? meeting.meetingType,
            meetingDate: dto.meetingDate === undefined
                ? meeting.meetingDate
                : this.normalizeDate(dto.meetingDate),
            startTime: dto.startTime === undefined
                ? meeting.startTime
                : this.toDateOrNull(dto.startTime),
            endTime: dto.endTime === undefined
                ? meeting.endTime
                : this.toDateOrNull(dto.endTime),
        });
        return {
            success: true,
            message: 'Update meeting successfully',
            data: {
                meeting: this.toMeetingResponse(updatedMeeting),
            },
        };
    }
    async cancelMeeting(currentUserId, workspaceId, projectId, meetingId) {
        await this.changeMeetingStatus(currentUserId, workspaceId, projectId, meetingId, meeting_status_enum_1.MeetingStatus.Cancelled);
        return {
            success: true,
            message: 'Cancel meeting successfully',
            data: null,
        };
    }
    async completeMeeting(currentUserId, workspaceId, projectId, meetingId) {
        await this.changeMeetingStatus(currentUserId, workspaceId, projectId, meetingId, meeting_status_enum_1.MeetingStatus.Completed, { actualEndTime: new Date() });
        this.meetingLifecycleService.publishMeetingCompleted({
            currentUserId,
            workspaceId,
            projectId,
            meetingId,
            reason: 'MANUAL',
        });
        return {
            success: true,
            message: 'Complete meeting successfully',
            data: null,
        };
    }
    async markMeetingInProgress(projectId, meetingId) {
        return this.meetingsRepository.markInProgress(meetingId, projectId);
    }
    async autoCompleteMeeting(meeting) {
        if (meeting.status === meeting_status_enum_1.MeetingStatus.Completed) {
            return false;
        }
        await this.meetingsRepository.update(meeting, {
            status: meeting_status_enum_1.MeetingStatus.Completed,
            actualEndTime: new Date(),
            autoCompleted: true,
        });
        this.meetingLifecycleService.publishMeetingCompleted({
            currentUserId: meeting.createdBy,
            workspaceId: meeting.workspaceId,
            projectId: meeting.projectId,
            meetingId: meeting.id,
            reason: 'AUTO',
        });
        return true;
    }
    async deleteMeeting(currentUserId, workspaceId, projectId, meetingId) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.meetingAccessService.assertUserCanViewMeeting(currentUserId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        const isManager = await this.meetingAccessService.isMeetingManager(currentUserId, workspaceId);
        if (!isManager && meeting.createdBy !== currentUserId) {
            throw new common_1.ForbiddenException('You can not delete this meeting');
        }
        await this.meetingsRepository.softDelete(meeting);
        return {
            success: true,
            message: 'Delete meeting successfully',
            data: null,
        };
    }
    async changeMeetingStatus(currentUserId, workspaceId, projectId, meetingId, status, extraData = {}) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.meetingAccessService.assertUserCanManageMeeting(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const meeting = await this.meetingAccessService.assertMeetingInProject(meetingId, projectId);
        this.meetingAccessService.assertMeetingEditable(meeting);
        if (status === meeting_status_enum_1.MeetingStatus.Completed &&
            meeting.status === meeting_status_enum_1.MeetingStatus.Completed) {
            throw new common_1.ConflictException('Cuoc hop nay da duoc ket thuc');
        }
        await this.meetingsRepository.update(meeting, { status, ...extraData });
    }
    async assertValidMeetingFilters(projectId, query) {
        if (query.fromDate && query.toDate) {
            const fromDate = this.normalizeDate(query.fromDate);
            const toDate = this.normalizeDate(query.toDate);
            if (fromDate > toDate) {
                throw new common_1.BadRequestException('fromDate must be before or equal to toDate');
            }
        }
        await this.assertSprintFilter(projectId, query.sprintId);
    }
    async assertSprintFilter(projectId, sprintId) {
        if (sprintId) {
            await this.sprintAccessService.assertSprintInProject(sprintId, projectId);
        }
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
    assertTimeRange(startTime, endTime) {
        if (!startTime || !endTime) {
            return;
        }
        if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
            throw new common_1.BadRequestException('endTime must be after startTime');
        }
    }
    uniqueUserIds(userIds) {
        return [...new Set(userIds)];
    }
    normalizeDate(value) {
        return value.slice(0, 10);
    }
    optionalText(value) {
        if (value === null || value === undefined) {
            return null;
        }
        const trimmedValue = value.trim();
        return trimmedValue.length ? trimmedValue : null;
    }
    toDateOrNull(value) {
        return value ? new Date(value) : null;
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
    toMeetingResponse(meeting) {
        return {
            id: meeting.id,
            workspaceId: meeting.workspaceId,
            projectId: meeting.projectId,
            sprintId: meeting.sprintId,
            title: meeting.title,
            description: meeting.description,
            meetingType: meeting.meetingType,
            meetingDate: meeting.meetingDate,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            actualStartTime: meeting.actualStartTime,
            actualEndTime: meeting.actualEndTime,
            autoCompleted: meeting.autoCompleted,
            status: meeting.status,
            createdBy: meeting.createdBy,
            creator: meeting.creator
                ? {
                    id: meeting.creator.id,
                    fullName: meeting.creator.fullName,
                    email: meeting.creator.email,
                }
                : null,
            sprint: meeting.sprint
                ? {
                    id: meeting.sprint.id,
                    name: meeting.sprint.name,
                    status: meeting.sprint.status,
                }
                : null,
            participants: meeting.participants?.map((participant) => this.toParticipantResponse(participant)),
            mongoTranscriptId: meeting.mongoTranscriptId,
            mongoSummaryId: meeting.mongoSummaryId,
            createdAt: meeting.createdAt,
            updatedAt: meeting.updatedAt,
        };
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        meetings_repository_1.MeetingsRepository,
        meeting_participants_repository_1.MeetingParticipantsRepository,
        meeting_access_service_1.MeetingAccessService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService,
        sprint_access_service_1.SprintAccessService,
        meeting_lifecycle_service_1.MeetingLifecycleService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map