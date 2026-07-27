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
exports.AiTeamReportActionItemController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const team_report_action_item_status_enum_1 = require("../../../common/enums/team-report-action-item-status.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const create_team_report_task_dto_1 = require("../dto/create-team-report-task.dto");
const dismiss_team_report_action_item_dto_1 = require("../dto/dismiss-team-report-action-item.dto");
const request_team_report_handover_dto_1 = require("../dto/request-team-report-handover.dto");
const ai_team_report_action_item_service_1 = require("../services/ai-team-report-action-item.service");
let AiTeamReportActionItemController = class AiTeamReportActionItemController {
    service;
    constructor(service) {
        this.service = service;
    }
    getActionItems(user, workspaceId, projectId, reportId) {
        return this.service.getActionItems(user.id, workspaceId, projectId, reportId);
    }
    createTask(user, workspaceId, projectId, reportId, dto) {
        return this.service.createTaskFromActionItem(user.id, workspaceId, projectId, reportId, dto);
    }
    requestHandover(user, workspaceId, projectId, reportId, dto) {
        return this.service.requestHandoverFromActionItem(user.id, workspaceId, projectId, reportId, dto);
    }
    dismiss(user, workspaceId, projectId, reportId, source, itemIndex, dto) {
        return this.service.dismissActionItem(user.id, workspaceId, projectId, reportId, source, itemIndex, dto);
    }
};
exports.AiTeamReportActionItemController = AiTeamReportActionItemController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List blockers and recommendations of a team daily report',
        description: 'Gop vuong mac va de xuat cua bao cao giao ban thanh mot danh sach kem trang thai da xu ly hay chua.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'reportId', example: 'report-object-id' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AiTeamReportActionItemController.prototype, "getActionItems", null);
__decorate([
    (0, common_1.Post)('tasks'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a task from a report item',
        description: 'Chi OWNER, SCRUM_MASTER, PROJECT_MANAGER duoc chot; quyen kiem tra trong service.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'reportId', example: 'report-object-id' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Create task successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('reportId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, create_team_report_task_dto_1.CreateTeamReportTaskDto]),
    __metadata("design:returntype", void 0)
], AiTeamReportActionItemController.prototype, "createTask", null);
__decorate([
    (0, common_1.Post)('handover-requests'),
    (0, swagger_1.ApiOperation)({
        summary: 'Request a task handover from a report item',
        description: 'Ghi nhan de nghi ban giao. Ban giao that van do nguoi dang giu task tu tao.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'reportId', example: 'report-object-id' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Request handover successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('reportId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, request_team_report_handover_dto_1.RequestTeamReportHandoverDto]),
    __metadata("design:returntype", void 0)
], AiTeamReportActionItemController.prototype, "requestHandover", null);
__decorate([
    (0, common_1.Delete)(':source/:itemIndex'),
    (0, swagger_1.ApiOperation)({
        summary: 'Dismiss a report item',
        description: 'Danh dau muc de xuat la khong xu ly, kem ly do neu co.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'reportId', example: 'report-object-id' }),
    (0, swagger_1.ApiParam)({ name: 'source', enum: team_report_action_item_status_enum_1.TeamReportActionItemSource }),
    (0, swagger_1.ApiParam)({ name: 'itemIndex', example: 0 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('reportId')),
    __param(4, (0, common_1.Param)('source')),
    __param(5, (0, common_1.Param)('itemIndex', common_1.ParseIntPipe)),
    __param(6, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number, dismiss_team_report_action_item_dto_1.DismissTeamReportActionItemDto]),
    __metadata("design:returntype", void 0)
], AiTeamReportActionItemController.prototype, "dismiss", null);
exports.AiTeamReportActionItemController = AiTeamReportActionItemController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/ai/team-daily-reports/:reportId/action-items'),
    (0, swagger_1.ApiTags)('AI Team Report Action Items'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    __metadata("design:paramtypes", [ai_team_report_action_item_service_1.AiTeamReportActionItemService])
], AiTeamReportActionItemController);
//# sourceMappingURL=ai-team-report-action-item.controller.js.map