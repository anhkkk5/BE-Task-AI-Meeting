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
exports.MeetingImportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const meeting_import_service_1 = require("../services/meeting-import.service");
const managerRoles = [workspace_role_enum_1.WorkspaceRole.Owner, workspace_role_enum_1.WorkspaceRole.ScrumMaster, workspace_role_enum_1.WorkspaceRole.ProjectManager];
let MeetingImportController = class MeetingImportController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(user, workspaceId, projectId, file) {
        return this.service.createJob(user.id, workspaceId, projectId, file);
    }
    latest(user, workspaceId, projectId) {
        return this.service.getLatestJob(user.id, workspaceId, projectId);
    }
    list(user, workspaceId, projectId) {
        return this.service.listJobs(user.id, workspaceId, projectId);
    }
    get(user, workspaceId, projectId, jobId) {
        return this.service.getJob(user.id, workspaceId, projectId, jobId);
    }
};
exports.MeetingImportController = MeetingImportController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 200 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload tài liệu, audio hoặc video và tạo tóm tắt cuộc họp' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], MeetingImportController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('latest'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MeetingImportController.prototype, "latest", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], MeetingImportController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':jobId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], MeetingImportController.prototype, "get", null);
exports.MeetingImportController = MeetingImportController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/ai/content-analysis'),
    (0, swagger_1.ApiTags)('AI Meeting Imports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard, workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...managerRoles),
    __metadata("design:paramtypes", [meeting_import_service_1.MeetingImportService])
], MeetingImportController);
//# sourceMappingURL=meeting-import.controller.js.map