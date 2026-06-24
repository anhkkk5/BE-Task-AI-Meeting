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
exports.MeetingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const create_meeting_dto_1 = require("../dto/create-meeting.dto");
const get_meetings_query_dto_1 = require("../dto/get-meetings-query.dto");
const update_meeting_dto_1 = require("../dto/update-meeting.dto");
const meetings_service_1 = require("../services/meetings.service");
const meetingManagerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let MeetingsController = class MeetingsController {
    meetingsService;
    constructor(meetingsService) {
        this.meetingsService = meetingsService;
    }
    createMeeting(user, workspaceId, projectId, dto) {
        return this.meetingsService.createMeeting(user.id, workspaceId, projectId, dto);
    }
    getMeetings(user, workspaceId, projectId, query) {
        return this.meetingsService.getMeetings(user.id, workspaceId, projectId, query);
    }
    getMeetingDetail(user, workspaceId, projectId, meetingId) {
        return this.meetingsService.getMeetingDetail(user.id, workspaceId, projectId, meetingId);
    }
    updateMeeting(user, workspaceId, projectId, meetingId, dto) {
        return this.meetingsService.updateMeeting(user.id, workspaceId, projectId, meetingId, dto);
    }
    cancelMeeting(user, workspaceId, projectId, meetingId) {
        return this.meetingsService.cancelMeeting(user.id, workspaceId, projectId, meetingId);
    }
    completeMeeting(user, workspaceId, projectId, meetingId) {
        return this.meetingsService.completeMeeting(user.id, workspaceId, projectId, meetingId);
    }
};
exports.MeetingsController = MeetingsController;
__decorate([
    (0, common_1.Post)(),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...meetingManagerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Create meeting',
        description: 'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao meeting.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Create meeting successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, create_meeting_dto_1.CreateMeetingDto]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "createMeeting", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get project meetings',
        description: 'Workspace member ACTIVE nao cung xem duoc meeting.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_meetings_query_dto_1.GetMeetingsQueryDto]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "getMeetings", null);
__decorate([
    (0, common_1.Get)(':meetingId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get meeting detail' }),
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
], MeetingsController.prototype, "getMeetingDetail", null);
__decorate([
    (0, common_1.Patch)(':meetingId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...meetingManagerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update meeting' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, update_meeting_dto_1.UpdateMeetingDto]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "updateMeeting", null);
__decorate([
    (0, common_1.Patch)(':meetingId/cancel'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...meetingManagerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel meeting' }),
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
], MeetingsController.prototype, "cancelMeeting", null);
__decorate([
    (0, common_1.Patch)(':meetingId/complete'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...meetingManagerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Complete meeting' }),
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
], MeetingsController.prototype, "completeMeeting", null);
exports.MeetingsController = MeetingsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/meetings'),
    (0, swagger_1.ApiTags)('Meetings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [meetings_service_1.MeetingsService])
], MeetingsController);
//# sourceMappingURL=meetings.controller.js.map