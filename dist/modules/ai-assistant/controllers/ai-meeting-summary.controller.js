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
exports.AiMeetingSummaryDetailController = exports.AiMeetingSummaryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const generate_meeting_summary_dto_1 = require("../dto/generate-meeting-summary.dto");
const get_meeting_summaries_query_dto_1 = require("../dto/get-meeting-summaries-query.dto");
const ai_meeting_summary_service_1 = require("../services/ai-meeting-summary.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let AiMeetingSummaryController = class AiMeetingSummaryController {
    aiMeetingSummaryService;
    constructor(aiMeetingSummaryService) {
        this.aiMeetingSummaryService = aiMeetingSummaryService;
    }
    generateMeetingSummary(user, workspaceId, projectId, meetingId, dto) {
        return this.aiMeetingSummaryService.generateMeetingSummary(user.id, workspaceId, projectId, meetingId, dto);
    }
    getMeetingSummary(user, workspaceId, projectId, meetingId) {
        return this.aiMeetingSummaryService.getMeetingSummary(user.id, workspaceId, projectId, meetingId);
    }
    getMeetingSummaries(user, workspaceId, projectId, meetingId, query) {
        return this.aiMeetingSummaryService.getMeetingSummaries(user.id, workspaceId, projectId, meetingId, query);
    }
};
exports.AiMeetingSummaryController = AiMeetingSummaryController;
__decorate([
    (0, common_1.Post)('summary'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate AI meeting summary',
        description: 'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao summary tu transcript meeting.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Generate meeting summary successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, generate_meeting_summary_dto_1.GenerateMeetingSummaryDto]),
    __metadata("design:returntype", void 0)
], AiMeetingSummaryController.prototype, "generateMeetingSummary", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get latest AI meeting summary',
        description: 'Manager duoc xem. MEMBER chi duoc xem neu la participant cua meeting. VIEWER bi chan.',
    }),
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
], AiMeetingSummaryController.prototype, "getMeetingSummary", null);
__decorate([
    (0, common_1.Get)('summaries'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI meeting summary history' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'meetingId', example: 'meeting-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('meetingId')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, get_meeting_summaries_query_dto_1.GetMeetingSummariesQueryDto]),
    __metadata("design:returntype", void 0)
], AiMeetingSummaryController.prototype, "getMeetingSummaries", null);
exports.AiMeetingSummaryController = AiMeetingSummaryController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/meetings/:meetingId/ai'),
    (0, swagger_1.ApiTags)('AI Meeting Summaries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [ai_meeting_summary_service_1.AiMeetingSummaryService])
], AiMeetingSummaryController);
let AiMeetingSummaryDetailController = class AiMeetingSummaryDetailController {
    aiMeetingSummaryService;
    constructor(aiMeetingSummaryService) {
        this.aiMeetingSummaryService = aiMeetingSummaryService;
    }
    getMeetingSummaryDetail(user, workspaceId, projectId, summaryId) {
        return this.aiMeetingSummaryService.getMeetingSummaryDetail(user.id, workspaceId, projectId, summaryId);
    }
};
exports.AiMeetingSummaryDetailController = AiMeetingSummaryDetailController;
__decorate([
    (0, common_1.Get)(':summaryId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI meeting summary detail by summary id' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'summaryId', example: 'mongo-summary-id' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('summaryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AiMeetingSummaryDetailController.prototype, "getMeetingSummaryDetail", null);
exports.AiMeetingSummaryDetailController = AiMeetingSummaryDetailController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/ai/meeting-summaries'),
    (0, swagger_1.ApiTags)('AI Meeting Summaries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    __metadata("design:paramtypes", [ai_meeting_summary_service_1.AiMeetingSummaryService])
], AiMeetingSummaryDetailController);
//# sourceMappingURL=ai-meeting-summary.controller.js.map