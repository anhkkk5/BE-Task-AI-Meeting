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
exports.AiPersonalizedMeetingSummaryProjectController = exports.AiPersonalizedMeetingSummaryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const generate_personalized_meeting_summary_dto_1 = require("../dto/generate-personalized-meeting-summary.dto");
const get_my_meeting_action_items_query_dto_1 = require("../dto/get-my-meeting-action-items-query.dto");
const ai_personalized_meeting_summary_service_1 = require("../services/ai-personalized-meeting-summary.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let AiPersonalizedMeetingSummaryController = class AiPersonalizedMeetingSummaryController {
    personalizedMeetingSummaryService;
    constructor(personalizedMeetingSummaryService) {
        this.personalizedMeetingSummaryService = personalizedMeetingSummaryService;
    }
    generateMyPersonalizedMeetingSummary(user, workspaceId, projectId, meetingId, dto) {
        return this.personalizedMeetingSummaryService.generateMyPersonalizedMeetingSummary(user.id, workspaceId, projectId, meetingId, dto);
    }
    generateMemberPersonalizedMeetingSummary(user, workspaceId, projectId, meetingId, memberId, dto) {
        return this.personalizedMeetingSummaryService.generateMemberPersonalizedMeetingSummary(user.id, workspaceId, projectId, meetingId, memberId, dto);
    }
    generateAllPersonalizedMeetingSummaries(user, workspaceId, projectId, meetingId, dto) {
        return this.personalizedMeetingSummaryService.generateAllPersonalizedMeetingSummaries(user.id, workspaceId, projectId, meetingId, dto);
    }
    getMyPersonalizedMeetingSummary(user, workspaceId, projectId, meetingId) {
        return this.personalizedMeetingSummaryService.getMyPersonalizedMeetingSummary(user.id, workspaceId, projectId, meetingId);
    }
    getMemberPersonalizedMeetingSummary(user, workspaceId, projectId, meetingId, memberId) {
        return this.personalizedMeetingSummaryService.getMemberPersonalizedMeetingSummary(user.id, workspaceId, projectId, meetingId, memberId);
    }
};
exports.AiPersonalizedMeetingSummaryController = AiPersonalizedMeetingSummaryController;
__decorate([
    (0, common_1.Post)('personalized-summary/me'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate my personalized meeting summary',
        description: 'MEMBER chi duoc tao summary cua minh neu la participant. VIEWER bi chan trong service.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Generate my personalized meeting summary successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, generate_personalized_meeting_summary_dto_1.GeneratePersonalizedMeetingSummaryDto]),
    __metadata("design:returntype", void 0)
], AiPersonalizedMeetingSummaryController.prototype, "generateMyPersonalizedMeetingSummary", null);
__decorate([
    (0, common_1.Post)('personalized-summary/member/:memberId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate personalized meeting summary for member',
        description: 'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao summary cho participant.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', example: 'member-user-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Generate member personalized meeting summary successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Param)('memberId')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, generate_personalized_meeting_summary_dto_1.GeneratePersonalizedMeetingSummaryDto]),
    __metadata("design:returntype", void 0)
], AiPersonalizedMeetingSummaryController.prototype, "generateMemberPersonalizedMeetingSummary", null);
__decorate([
    (0, common_1.Post)('personalized-summaries'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate personalized meeting summaries for all participants',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Generate personalized summaries for all participants.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, generate_personalized_meeting_summary_dto_1.GeneratePersonalizedMeetingSummaryDto]),
    __metadata("design:returntype", void 0)
], AiPersonalizedMeetingSummaryController.prototype, "generateAllPersonalizedMeetingSummaries", null);
__decorate([
    (0, common_1.Get)('personalized-summary/me'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get my personalized meeting summary' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Get my personalized meeting summary successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AiPersonalizedMeetingSummaryController.prototype, "getMyPersonalizedMeetingSummary", null);
__decorate([
    (0, common_1.Get)('personalized-summary/member/:memberId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get member personalized meeting summary' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', example: 'member-user-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Get member personalized meeting summary successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AiPersonalizedMeetingSummaryController.prototype, "getMemberPersonalizedMeetingSummary", null);
exports.AiPersonalizedMeetingSummaryController = AiPersonalizedMeetingSummaryController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/meetings/:meetingId/ai'),
    (0, swagger_1.ApiTags)('AI Personalized Meeting Summaries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [ai_personalized_meeting_summary_service_1.AiPersonalizedMeetingSummaryService])
], AiPersonalizedMeetingSummaryController);
let AiPersonalizedMeetingSummaryProjectController = class AiPersonalizedMeetingSummaryProjectController {
    personalizedMeetingSummaryService;
    constructor(personalizedMeetingSummaryService) {
        this.personalizedMeetingSummaryService = personalizedMeetingSummaryService;
    }
    getPersonalizedMeetingSummaryDetail(user, workspaceId, projectId, summaryId) {
        return this.personalizedMeetingSummaryService.getPersonalizedMeetingSummaryDetail(user.id, workspaceId, projectId, summaryId);
    }
    getMyMeetingActionItems(user, workspaceId, projectId, query) {
        return this.personalizedMeetingSummaryService.getMyMeetingActionItems(user.id, workspaceId, projectId, query);
    }
};
exports.AiPersonalizedMeetingSummaryProjectController = AiPersonalizedMeetingSummaryProjectController;
__decorate([
    (0, common_1.Get)('personalized-meeting-summaries/:summaryId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized meeting summary detail' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'summaryId', example: 'mongo-summary-id' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Get personalized meeting summary detail successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('summaryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AiPersonalizedMeetingSummaryProjectController.prototype, "getPersonalizedMeetingSummaryDetail", null);
__decorate([
    (0, common_1.Get)('meeting-action-items/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my action items from personalized summaries' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiQuery)({
        name: 'meetingId',
        required: false,
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01001',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sprintId',
        required: false,
        example: '9d38e4c2-0d77-4d6c-9127-b06b66d01002',
    }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false, example: '2026-06-01' }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false, example: '2026-06-30' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Get my meeting action items successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_my_meeting_action_items_query_dto_1.GetMyMeetingActionItemsQueryDto]),
    __metadata("design:returntype", void 0)
], AiPersonalizedMeetingSummaryProjectController.prototype, "getMyMeetingActionItems", null);
exports.AiPersonalizedMeetingSummaryProjectController = AiPersonalizedMeetingSummaryProjectController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/ai'),
    (0, swagger_1.ApiTags)('AI Personalized Meeting Summaries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    __metadata("design:paramtypes", [ai_personalized_meeting_summary_service_1.AiPersonalizedMeetingSummaryService])
], AiPersonalizedMeetingSummaryProjectController);
//# sourceMappingURL=ai-personalized-meeting-summary.controller.js.map