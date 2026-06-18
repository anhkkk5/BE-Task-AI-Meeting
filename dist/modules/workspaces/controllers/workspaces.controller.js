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
exports.WorkspacesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const create_workspace_dto_1 = require("../dto/create-workspace.dto");
const get_workspaces_query_dto_1 = require("../dto/get-workspaces-query.dto");
const update_workspace_dto_1 = require("../dto/update-workspace.dto");
const workspaces_service_1 = require("../services/workspaces.service");
let WorkspacesController = class WorkspacesController {
    workspacesService;
    constructor(workspacesService) {
        this.workspacesService = workspacesService;
    }
    createWorkspace(user, dto) {
        return this.workspacesService.createWorkspace(user.id, dto);
    }
    getMyWorkspaces(user, query) {
        return this.workspacesService.getMyWorkspaces(user.id, query);
    }
    getWorkspaceDetail(user, workspaceId) {
        return this.workspacesService.getWorkspaceDetail(user.id, workspaceId);
    }
    updateWorkspace(user, workspaceId, dto) {
        return this.workspacesService.updateWorkspace(user.id, workspaceId, dto);
    }
    archiveWorkspace(user, workspaceId) {
        return this.workspacesService.archiveWorkspace(user.id, workspaceId);
    }
};
exports.WorkspacesController = WorkspacesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create workspace',
        description: 'Tao workspace moi. User hien tai se tu dong tro thanh OWNER.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Create workspace successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_workspace_dto_1.CreateWorkspaceDto]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "createWorkspace", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my workspaces',
        description: 'Lay danh sach workspace ma user hien tai dang tham gia.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Get workspaces successfully.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_workspaces_query_dto_1.GetWorkspacesQueryDto]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "getMyWorkspaces", null);
__decorate([
    (0, common_1.Get)(':workspaceId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workspace detail',
        description: 'Chi member cua workspace moi xem duoc chi tiet.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Get workspace detail successfully.',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'User khong thuoc workspace.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "getWorkspaceDetail", null);
__decorate([
    (0, common_1.Patch)(':workspaceId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update workspace',
        description: 'Chi OWNER duoc cap nhat name/description cua workspace.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Update workspace successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'User khong phai OWNER.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_workspace_dto_1.UpdateWorkspaceDto]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "updateWorkspace", null);
__decorate([
    (0, common_1.Patch)(':workspaceId/archive'),
    (0, swagger_1.ApiOperation)({
        summary: 'Archive workspace',
        description: 'Chi OWNER duoc archive workspace. Khong hard delete.',
    }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId', example: 'workspace-uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archive workspace successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'User khong phai OWNER.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkspacesController.prototype, "archiveWorkspace", null);
exports.WorkspacesController = WorkspacesController = __decorate([
    (0, common_1.Controller)('workspaces'),
    (0, swagger_1.ApiTags)('Workspaces'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [workspaces_service_1.WorkspacesService])
], WorkspacesController);
//# sourceMappingURL=workspaces.controller.js.map