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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingAccessService = void 0;
const common_1 = require("@nestjs/common");
const meeting_status_enum_1 = require("../../../common/enums/meeting-status.enum");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const meetings_repository_1 = require("../repositories/meetings.repository");
const meetingManagerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let MeetingAccessService = class MeetingAccessService {
    meetingsRepository;
    workspaceAccessService;
    constructor(meetingsRepository, workspaceAccessService) {
        this.meetingsRepository = meetingsRepository;
        this.workspaceAccessService = workspaceAccessService;
    }
    getMeetingInProject(meetingId, projectId) {
        return this.meetingsRepository.findByIdAndProject(meetingId, projectId);
    }
    async assertMeetingInProject(meetingId, projectId) {
        const meeting = await this.getMeetingInProject(meetingId, projectId);
        if (!meeting) {
            throw new common_1.NotFoundException('Meeting not found in this project');
        }
        return meeting;
    }
    assertMeetingEditable(meeting) {
        if ([meeting_status_enum_1.MeetingStatus.Cancelled, meeting_status_enum_1.MeetingStatus.Archived].includes(meeting.status)) {
            throw new common_1.BadRequestException('Cancelled or archived meeting can not be updated');
        }
    }
    async assertUserCanManageMeeting(userId, workspaceId) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(userId, workspaceId);
        if (!role || !meetingManagerRoles.includes(role)) {
            throw new common_1.ForbiddenException('You can not manage this meeting');
        }
        return role;
    }
    async assertUserCanViewMeeting(userId, workspaceId) {
        return this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
    }
    async isMeetingManager(userId, workspaceId) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(userId, workspaceId);
        return Boolean(role && meetingManagerRoles.includes(role));
    }
};
exports.MeetingAccessService = MeetingAccessService;
exports.MeetingAccessService = MeetingAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meetings_repository_1.MeetingsRepository,
        workspace_access_service_1.WorkspaceAccessService])
], MeetingAccessService);
//# sourceMappingURL=meeting-access.service.js.map