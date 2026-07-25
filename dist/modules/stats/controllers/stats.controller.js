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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const stats_service_1 = require("../services/stats.service");
let StatsController = class StatsController {
    statsService;
    constructor(statsService) {
        this.statsService = statsService;
    }
    getWorkspacesOverview(user) {
        return this.statsService.getWorkspacesOverview(user.id);
    }
    getWorkspaceDashboard(user, workspaceId) {
        return this.statsService.getWorkspaceDashboard(user.id, workspaceId);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)('workspaces'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workspaces overview stats',
        description: 'Tong hop so project, member, meeting, task cua tat ca workspace ma user tham gia.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Get overview stats successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "getWorkspacesOverview", null);
__decorate([
    (0, common_1.Get)('workspaces/:workspaceId/dashboard'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workspace dashboard stats',
        description: 'So lieu chi tiet cho dashboard: project, task theo status, sprint dang chay, deadline sap toi.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Get dashboard stats successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "getWorkspaceDashboard", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.Controller)('stats'),
    (0, swagger_1.ApiTags)('Stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map