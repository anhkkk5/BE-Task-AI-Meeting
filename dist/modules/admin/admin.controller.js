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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const system_admin_guard_1 = require("../../common/guards/system-admin.guard");
const access_token_guard_1 = require("../auth/guards/access-token.guard");
const admin_service_1 = require("./admin.service");
const observability_service_1 = require("../observability/observability.service");
let AdminController = class AdminController {
    adminService;
    observability;
    constructor(adminService, observability) {
        this.adminService = adminService;
        this.observability = observability;
    }
    getSystemStats() {
        return this.adminService.getSystemStats();
    }
    getObservability(hours) { return this.observability.summary(Math.min(168, Math.max(1, Number(hours) || 24))).then((data) => ({ success: true, message: 'Success', data })); }
    getAuditLogs(page, limit) { return this.observability.auditLogs(Math.max(1, Number(page) || 1), Math.min(100, Math.max(1, Number(limit) || 50))).then((data) => ({ success: true, message: 'Success', data })); }
    getAllUsers(page, limit, search, status) {
        return this.adminService.getAllUsers({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            search,
            status,
        });
    }
    toggleUserStatus(admin, userId) {
        return this.adminService.toggleUserStatus(admin.id, userId);
    }
    toggleAdminRole(admin, userId) {
        return this.adminService.toggleAdminRole(admin.id, userId);
    }
    getAllWorkspaces(page, limit, search, status) {
        return this.adminService.getAllWorkspaces({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            search,
            status,
        });
    }
    toggleWorkspaceStatus(admin, workspaceId) {
        return this.adminService.toggleWorkspaceStatus(admin.id, workspaceId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: '[ADMIN] Thống kê tổng quan hệ thống',
        description: 'Tổng số users, workspaces, dự án, task, cuộc họp.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSystemStats", null);
__decorate([
    (0, common_1.Get)('observability'),
    __param(0, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getObservability", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN] Danh sách tất cả users trong hệ thống' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['active', 'inactive', 'admin'],
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Patch)('users/:userId/status'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN] Bật / Tắt tài khoản user' }),
    (0, swagger_1.ApiParam)({ name: 'userId' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.Patch)('users/:userId/admin'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN] Cấp / Thu hồi quyền System Admin' }),
    (0, swagger_1.ApiParam)({ name: 'userId' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleAdminRole", null);
__decorate([
    (0, common_1.Get)('workspaces'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN] Danh sách tất cả workspaces' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['active', 'archived'] }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllWorkspaces", null);
__decorate([
    (0, common_1.Patch)('workspaces/:workspaceId/status'),
    (0, swagger_1.ApiOperation)({ summary: '[ADMIN] Bật / Archive workspace' }),
    (0, swagger_1.ApiParam)({ name: 'workspaceId' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleWorkspaceStatus", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, swagger_1.ApiTags)('System Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard, system_admin_guard_1.SystemAdminGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService, observability_service_1.ObservabilityService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map