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
exports.MeetingParticipantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const add_meeting_participants_dto_1 = require("../dto/add-meeting-participants.dto");
const update_participant_attendance_dto_1 = require("../dto/update-participant-attendance.dto");
const meeting_participants_service_1 = require("../services/meeting-participants.service");
const meetingManagerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let MeetingParticipantsController = class MeetingParticipantsController {
    meetingParticipantsService;
    constructor(meetingParticipantsService) {
        this.meetingParticipantsService = meetingParticipantsService;
    }
    addParticipants(user, workspaceId, projectId, meetingId, dto) {
        return this.meetingParticipantsService.addParticipants(user.id, workspaceId, projectId, meetingId, dto);
    }
    getParticipants(user, workspaceId, projectId, meetingId) {
        return this.meetingParticipantsService.getParticipants(user.id, workspaceId, projectId, meetingId);
    }
    updateAttendance(user, workspaceId, projectId, meetingId, participantId, dto) {
        return this.meetingParticipantsService.updateAttendance(user.id, workspaceId, projectId, meetingId, participantId, dto);
    }
};
exports.MeetingParticipantsController = MeetingParticipantsController;
__decorate([
    (0, common_1.Post)(),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...meetingManagerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add meeting participants' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, add_meeting_participants_dto_1.AddMeetingParticipantsDto]),
    __metadata("design:returntype", void 0)
], MeetingParticipantsController.prototype, "addParticipants", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get meeting participants' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], MeetingParticipantsController.prototype, "getParticipants", null);
__decorate([
    (0, common_1.Patch)(':participantId/attendance'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update participant attendance' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'participantId', example: 'participant-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Param)('participantId')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, update_participant_attendance_dto_1.UpdateParticipantAttendanceDto]),
    __metadata("design:returntype", void 0)
], MeetingParticipantsController.prototype, "updateAttendance", null);
exports.MeetingParticipantsController = MeetingParticipantsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/meetings/:meetingId/participants'),
    (0, swagger_1.ApiTags)('Meeting Participants'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [meeting_participants_service_1.MeetingParticipantsService])
], MeetingParticipantsController);
//# sourceMappingURL=meeting-participants.controller.js.map