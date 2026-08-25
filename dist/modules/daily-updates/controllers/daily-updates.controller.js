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
exports.DailyUpdatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const create_daily_update_dto_1 = require("../dto/create-daily-update.dto");
const get_daily_updates_query_dto_1 = require("../dto/get-daily-updates-query.dto");
const update_daily_update_dto_1 = require("../dto/update-daily-update.dto");
const daily_updates_service_1 = require("../services/daily-updates.service");
const dailyUpdateWriterRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
    workspace_role_enum_1.WorkspaceRole.Member,
];
const dailyUpdateManagerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let DailyUpdatesController = class DailyUpdatesController {
    dailyUpdatesService;
    constructor(dailyUpdatesService) {
        this.dailyUpdatesService = dailyUpdatesService;
    }
    createDailyUpdate(user, workspaceId, projectId, dto) {
        return this.dailyUpdatesService.createDailyUpdate(user.id, workspaceId, projectId, dto);
    }
    getMyDailyUpdates(user, workspaceId, projectId, query) {
        return this.dailyUpdatesService.getMyDailyUpdates(user.id, workspaceId, projectId, query);
    }
    getMyReviewDraft(user, workspaceId, projectId, updateDate) {
        return this.dailyUpdatesService.getMyReviewDraft(user.id, workspaceId, projectId, updateDate);
    }
    getTeamDailyUpdates(user, workspaceId, projectId, query) {
        return this.dailyUpdatesService.getTeamDailyUpdates(user.id, workspaceId, projectId, query);
    }
    getDailyUpdateDetail(user, workspaceId, projectId, dailyUpdateId) {
        return this.dailyUpdatesService.getDailyUpdateDetail(user.id, workspaceId, projectId, dailyUpdateId);
    }
    updateDailyUpdate(user, workspaceId, projectId, dailyUpdateId, dto) {
        return this.dailyUpdatesService.updateDailyUpdate(user.id, workspaceId, projectId, dailyUpdateId, dto);
    }
    archiveDailyUpdate(user, workspaceId, projectId, dailyUpdateId) {
        return this.dailyUpdatesService.archiveDailyUpdate(user.id, workspaceId, projectId, dailyUpdateId);
    }
};
exports.DailyUpdatesController = DailyUpdatesController;
__decorate([
    (0, common_1.Post)(),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...dailyUpdateWriterRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Create daily update',
        description: 'OWNER, SCRUM_MASTER, PROJECT_MANAGER va MEMBER duoc viet daily update cua chinh minh. VIEWER khong duoc ghi.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Create daily update successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, create_daily_update_dto_1.CreateDailyUpdateDto]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "createDailyUpdate", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my daily updates',
        description: 'Lay danh sach daily update cua user dang dang nhap.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_daily_updates_query_dto_1.GetDailyUpdatesQueryDto]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "getMyDailyUpdates", null);
__decorate([
    (0, common_1.Get)('draft/pending'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get my pending AI daily update draft' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "getMyReviewDraft", null);
__decorate([
    (0, common_1.Get)(),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...dailyUpdateManagerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get team daily updates',
        description: 'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc xem daily update cua team.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_daily_updates_query_dto_1.GetDailyUpdatesQueryDto]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "getTeamDailyUpdates", null);
__decorate([
    (0, common_1.Get)(':dailyUpdateId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get daily update detail',
        description: 'Creator duoc xem daily update cua minh. OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc xem daily update team.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'dailyUpdateId', example: 'daily-update-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('dailyUpdateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "getDailyUpdateDetail", null);
__decorate([
    (0, common_1.Patch)(':dailyUpdateId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Update my daily update',
        description: 'Chi nguoi tao daily update duoc cap nhat. Manager khong sua daily update cua nguoi khac.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'dailyUpdateId', example: 'daily-update-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('dailyUpdateId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, update_daily_update_dto_1.UpdateDailyUpdateDto]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "updateDailyUpdate", null);
__decorate([
    (0, common_1.Patch)(':dailyUpdateId/archive'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Archive my daily update',
        description: 'Soft delete daily update bang deletedAt, khong hard delete.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'dailyUpdateId', example: 'daily-update-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('dailyUpdateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], DailyUpdatesController.prototype, "archiveDailyUpdate", null);
exports.DailyUpdatesController = DailyUpdatesController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/daily-updates'),
    (0, swagger_1.ApiTags)('Daily Updates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [daily_updates_service_1.DailyUpdatesService])
], DailyUpdatesController);
//# sourceMappingURL=daily-updates.controller.js.map