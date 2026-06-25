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
exports.AiPersonalReportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const generate_personal_report_dto_1 = require("../dto/generate-personal-report.dto");
const get_ai_reports_query_dto_1 = require("../dto/get-ai-reports-query.dto");
const ai_personal_report_service_1 = require("../services/ai-personal-report.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let AiPersonalReportController = class AiPersonalReportController {
    aiPersonalReportService;
    constructor(aiPersonalReportService) {
        this.aiPersonalReportService = aiPersonalReportService;
    }
    generateMyPersonalDailyReport(user, workspaceId, projectId, dto) {
        return this.aiPersonalReportService.generateMyPersonalDailyReport(user.id, workspaceId, projectId, dto);
    }
    generateMemberPersonalDailyReport(user, workspaceId, projectId, memberId, dto) {
        return this.aiPersonalReportService.generateMemberPersonalDailyReport(user.id, workspaceId, projectId, memberId, dto);
    }
    getMyPersonalDailyReports(user, workspaceId, projectId, query) {
        return this.aiPersonalReportService.getMyPersonalDailyReports(user.id, workspaceId, projectId, query);
    }
    getMemberPersonalDailyReports(user, workspaceId, projectId, memberId, query) {
        return this.aiPersonalReportService.getMemberPersonalDailyReports(user.id, workspaceId, projectId, memberId, query);
    }
    getPersonalDailyReportDetail(user, workspaceId, projectId, reportId) {
        return this.aiPersonalReportService.getPersonalDailyReportDetail(user.id, workspaceId, projectId, reportId);
    }
};
exports.AiPersonalReportController = AiPersonalReportController;
__decorate([
    (0, common_1.Post)('personal-daily-report'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate my personal daily report',
        description: 'OWNER, SCRUM_MASTER, PROJECT_MANAGER va MEMBER duoc tao report cho chinh minh. VIEWER bi chan trong service.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Generate personal daily report successfully.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, generate_personal_report_dto_1.GeneratePersonalReportDto]),
    __metadata("design:returntype", void 0)
], AiPersonalReportController.prototype, "generateMyPersonalDailyReport", null);
__decorate([
    (0, common_1.Post)('personal-daily-report/member/:memberId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate personal daily report for member',
        description: 'Chi OWNER, SCRUM_MASTER va PROJECT_MANAGER duoc tao report cho member.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', example: 'member-user-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('memberId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, generate_personal_report_dto_1.GeneratePersonalReportDto]),
    __metadata("design:returntype", void 0)
], AiPersonalReportController.prototype, "generateMemberPersonalDailyReport", null);
__decorate([
    (0, common_1.Get)('personal-daily-reports/me'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get my personal daily reports' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_ai_reports_query_dto_1.GetAiReportsQueryDto]),
    __metadata("design:returntype", void 0)
], AiPersonalReportController.prototype, "getMyPersonalDailyReports", null);
__decorate([
    (0, common_1.Get)('personal-daily-reports/member/:memberId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get member personal daily reports' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'projectId', example: 'project-uuid' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', example: 'member-user-uuid' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('memberId')),
    __param(4, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, get_ai_reports_query_dto_1.GetAiReportsQueryDto]),
    __metadata("design:returntype", void 0)
], AiPersonalReportController.prototype, "getMemberPersonalDailyReports", null);
__decorate([
    (0, common_1.Get)('personal-daily-reports/:reportId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get personal daily report detail' }),
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
], AiPersonalReportController.prototype, "getPersonalDailyReportDetail", null);
exports.AiPersonalReportController = AiPersonalReportController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/ai'),
    (0, swagger_1.ApiTags)('AI Personal Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [ai_personal_report_service_1.AiPersonalReportService])
], AiPersonalReportController);
//# sourceMappingURL=ai-personal-report.controller.js.map