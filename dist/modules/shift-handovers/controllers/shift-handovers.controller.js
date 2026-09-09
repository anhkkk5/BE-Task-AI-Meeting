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
exports.ShiftHandoversController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_2 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_member_guard_1 = require("../../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const create_handover_dto_1 = require("../dto/create-handover.dto");
const get_handovers_query_dto_1 = require("../dto/get-handovers-query.dto");
const reject_handover_dto_1 = require("../dto/reject-handover.dto");
const request_handover_changes_dto_1 = require("../dto/request-handover-changes.dto");
const update_handover_dto_1 = require("../dto/update-handover.dto");
const shift_handovers_service_1 = require("../services/shift-handovers.service");
const contributorRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
    workspace_role_enum_1.WorkspaceRole.Member,
];
let ShiftHandoversController = class ShiftHandoversController {
    service;
    constructor(service) {
        this.service = service;
    }
    uploadAttachments(request, files) {
        const origin = `${request.protocol}://${request.get('host')}`;
        return {
            success: true,
            message: 'Tải tệp đính kèm thành công',
            data: {
                files: (files ?? []).map((file) => ({
                    name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
                    size: file.size,
                    mimeType: file.mimetype,
                    url: `${origin}/uploads/handovers/${file.filename}`,
                })),
            },
        };
    }
    createHandover(user, workspaceId, projectId, dto) {
        return this.service.createHandover(user.id, workspaceId, projectId, dto);
    }
    getHandovers(user, workspaceId, projectId, query) {
        return this.service.getHandovers(user.id, workspaceId, projectId, query);
    }
    getHandover(user, workspaceId, projectId, handoverId) {
        return this.service.getHandover(user.id, workspaceId, projectId, handoverId);
    }
    updateHandover(user, workspaceId, projectId, handoverId, dto) {
        return this.service.updateHandover(user.id, workspaceId, projectId, handoverId, dto);
    }
    submit(user, workspaceId, projectId, handoverId) {
        return this.service.submitHandover(user.id, workspaceId, projectId, handoverId);
    }
    requestChanges(user, workspaceId, projectId, handoverId, dto) {
        return this.service.requestChanges(user.id, workspaceId, projectId, handoverId, dto.reason);
    }
    reject(user, workspaceId, projectId, handoverId, dto) {
        return this.service.reject(user.id, workspaceId, projectId, handoverId, dto.reason);
    }
    accept(user, workspaceId, projectId, handoverId) {
        return this.service.accept(user.id, workspaceId, projectId, handoverId);
    }
    deleteHandover(user, workspaceId, projectId, handoverId) {
        return this.service.deleteHandover(user.id, workspaceId, projectId, handoverId);
    }
};
exports.ShiftHandoversController = ShiftHandoversController;
__decorate([
    (0, common_1.Post)('attachments'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...contributorRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        limits: { fileSize: 10 * 1024 * 1024 },
        storage: (0, multer_1.diskStorage)({
            destination: (_request, _file, callback) => {
                const directory = (0, path_1.join)(process.cwd(), 'uploads', 'handovers');
                (0, fs_1.mkdirSync)(directory, { recursive: true });
                callback(null, directory);
            },
            filename: (_request, file, callback) => callback(null, `${(0, crypto_1.randomUUID)()}${(0, path_1.extname)(file.originalname).toLowerCase()}`),
        }),
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_2.ApiOperation)({ summary: 'Tải nhiều tệp đính kèm cho bản bàn giao' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "uploadAttachments", null);
__decorate([
    (0, common_1.Post)('handovers'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...contributorRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_2.ApiOperation)({
        summary: 'Tạo bản nháp bàn giao task',
        description: 'Người đang phụ trách task tạo nội dung bàn giao cho một thành viên khác. Task chưa đổi người phụ trách ở bước này.',
    }),
    (0, swagger_2.ApiResponse)({ status: 201, description: 'Tạo bản nháp thành công.' }),
    (0, swagger_2.ApiResponse)({
        status: 409,
        description: 'Task đã có yêu cầu bàn giao chưa hoàn tất.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, create_handover_dto_1.CreateHandoverDto]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "createHandover", null);
__decorate([
    (0, common_1.Get)('handovers'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_2.ApiOperation)({ summary: 'Lấy lịch sử bàn giao công việc' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, get_handovers_query_dto_1.GetHandoversQueryDto]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "getHandovers", null);
__decorate([
    (0, common_1.Get)('handovers/:handoverId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_2.ApiOperation)({ summary: 'Lấy chi tiết một bản bàn giao' }),
    (0, swagger_2.ApiParam)({ name: 'handoverId', description: 'ID bản bàn giao' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('handoverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "getHandover", null);
__decorate([
    (0, common_1.Patch)('handovers/:handoverId'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...contributorRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_2.ApiOperation)({
        summary: 'Bổ sung bản bàn giao',
        description: 'Người giao được sửa bản nháp hoặc bản đang bị yêu cầu bổ sung.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('handoverId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, update_handover_dto_1.UpdateHandoverDto]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "updateHandover", null);
__decorate([
    (0, common_1.Post)('handovers/:handoverId/submit'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...contributorRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_2.ApiOperation)({
        summary: 'Gửi yêu cầu bàn giao',
        description: 'Chuyển bản nháp sang trạng thái chờ người nhận xử lý.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('handoverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)('handovers/:handoverId/request-changes'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...contributorRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_2.ApiOperation)({
        summary: 'Yêu cầu bổ sung thông tin',
        description: 'Chỉ người nhận của yêu cầu đang chờ mới thực hiện được.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('handoverId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, request_handover_changes_dto_1.RequestHandoverChangesDto]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "requestChanges", null);
__decorate([
    (0, common_1.Post)('handovers/:handoverId/reject'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...contributorRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_2.ApiOperation)({
        summary: 'Từ chối nhận bàn giao',
        description: 'Người nhận từ chối và bắt buộc nêu lý do. Task vẫn thuộc người giao.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('handoverId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, reject_handover_dto_1.RejectHandoverDto]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('handovers/:handoverId/accept'),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...contributorRoles),
    (0, common_1.UseGuards)(workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, swagger_2.ApiOperation)({
        summary: 'Chấp nhận bàn giao',
        description: 'Chỉ người nhận được chấp nhận. Hệ thống đổi người phụ trách task từ người giao sang người nhận trong cùng transaction.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('handoverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "accept", null);
__decorate([
    (0, common_1.Delete)('handovers/:handoverId'),
    (0, common_1.UseGuards)(workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_2.ApiOperation)({
        summary: 'Xóa bản bàn giao',
        description: 'Người tạo bản bàn giao hoặc quản lý workspace được xóa mềm.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('handoverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ShiftHandoversController.prototype, "deleteHandover", null);
exports.ShiftHandoversController = ShiftHandoversController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/shift-handovers'),
    (0, swagger_2.ApiTags)('Bàn giao công việc'),
    (0, swagger_2.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __metadata("design:paramtypes", [shift_handovers_service_1.ShiftHandoversService])
], ShiftHandoversController);
//# sourceMappingURL=shift-handovers.controller.js.map