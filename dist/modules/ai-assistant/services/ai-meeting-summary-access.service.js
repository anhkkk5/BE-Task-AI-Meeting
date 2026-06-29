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
exports.AiMeetingSummaryAccessService = void 0;
const common_1 = require("@nestjs/common");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const meeting_participants_repository_1 = require("../../meetings/repositories/meeting-participants.repository");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let AiMeetingSummaryAccessService = class AiMeetingSummaryAccessService {
    meetingParticipantsRepository;
    workspaceAccessService;
    constructor(meetingParticipantsRepository, workspaceAccessService) {
        this.meetingParticipantsRepository = meetingParticipantsRepository;
        this.workspaceAccessService = workspaceAccessService;
    }
    async assertCanGenerateSummary(userId, workspaceId) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(userId, workspaceId);
        if (!role || !managerRoles.includes(role)) {
            throw new common_1.ForbiddenException('You can not generate meeting summary');
        }
        return role;
    }
    async assertCanViewSummary(userId, workspaceId, meetingId) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(userId, workspaceId);
        if (!role || role === workspace_role_enum_1.WorkspaceRole.Viewer) {
            throw new common_1.ForbiddenException('You can not view meeting summary');
        }
        if (managerRoles.includes(role)) {
            return role;
        }
        const participant = await this.meetingParticipantsRepository.findByMeetingAndUser(meetingId, userId);
        if (!participant) {
            throw new common_1.ForbiddenException('You can not view this meeting summary');
        }
        return role;
    }
};
exports.AiMeetingSummaryAccessService = AiMeetingSummaryAccessService;
exports.AiMeetingSummaryAccessService = AiMeetingSummaryAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meeting_participants_repository_1.MeetingParticipantsRepository,
        workspace_access_service_1.WorkspaceAccessService])
], AiMeetingSummaryAccessService);
//# sourceMappingURL=ai-meeting-summary-access.service.js.map