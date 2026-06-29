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
exports.AiTeamReportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const generate_team_report_dto_1 = require("../dto/generate-team-report.dto");
const get_ai_team_reports_query_dto_1 = require("../dto/get-ai-team-reports-query.dto");
const ai_team_report_service_1 = require("../services/ai-team-report.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let AiTeamReportController = class AiTeamReportController {
    aiTeamReportService;
    constructor(aiTeamReportService) {
        this.aiTeamReportService = aiTeamReportService;
    }
    generateTeamDailyReport(user, workspaceId, projectId, dto) {
        return this.aiTeamReportService.generateTeamDailyReport(user.id, workspaceId, projectId, dto);
    }
    getTeamDailyReports(user, workspaceId, projectId, query) {
        return this.aiTeamReportService.getTeamDailyReports(user.id, workspaceId, projectId, query);
    }
    getLatestTeamDailyReport(user, workspaceId, projectId, query) {
        return this.aiTeamReportService.getLatestTeamDailyReport(user.id, workspaceId, projectId, query);
    }
    getTeamDailyReportDetail(user, workspaceId, projectId, reportId) {
        return this.aiTeamReportService.getTeamDailyReportDetail(user.id, workspaceId, projectId, reportId);
    }
};
exports.AiTeamReportController = AiTeamReportController;
__decorate([
    (0, common_1.Post)('team-daily-report'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate AI team daily report',
        description: 'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao AI team daily report.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Generate team daily report successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, generate_team_report_dto_1.GenerateTeamReportDto]),
    __metadata("design:returntype", void 0)
], AiTeamReportController.prototype, "generateTeamDailyReport", null);
__decorate([
    (0, common_1.Get)('team-daily-reports'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI team daily reports' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_ai_team_reports_query_dto_1.GetAiTeamReportsQueryDto]),
    __metadata("design:returntype", void 0)
], AiTeamReportController.prototype, "getTeamDailyReports", null);
__decorate([
    (0, common_1.Get)('team-daily-reports/latest'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest AI team daily report' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_ai_team_reports_query_dto_1.GetAiTeamReportsQueryDto]),
    __metadata("design:returntype", void 0)
], AiTeamReportController.prototype, "getLatestTeamDailyReport", null);
__decorate([
    (0, common_1.Get)('team-daily-reports/:reportId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI team daily report detail' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'reportId', example: 'mongo-report-id' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AiTeamReportController.prototype, "getTeamDailyReportDetail", null);
exports.AiTeamReportController = AiTeamReportController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/ai'),
    (0, swagger_1.ApiTags)('AI Team Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [ai_team_report_service_1.AiTeamReportService])
], AiTeamReportController);
//# sourceMappingURL=ai-team-report.controller.js.map