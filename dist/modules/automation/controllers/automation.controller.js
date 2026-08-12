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
exports.AutomationController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_roles_decorator_1 = require("../../../common/decorators/workspace-roles.decorator");
const workspace_roles_guard_1 = require("../../../common/guards/workspace-roles.guard");
const access_token_guard_1 = require("../../auth/guards/access-token.guard");
const save_automation_rule_dto_1 = require("../dto/save-automation-rule.dto");
const automation_service_1 = require("../services/automation.service");
const roles = [workspace_role_enum_1.WorkspaceRole.Owner, workspace_role_enum_1.WorkspaceRole.ProjectManager, workspace_role_enum_1.WorkspaceRole.ScrumMaster];
let AutomationController = class AutomationController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(u, w, p) { return this.service.list(u.id, w, p); }
    create(u, w, p, dto) { return this.service.save(u.id, w, p, dto); }
    update(u, w, p, id, dto) { return this.service.save(u.id, w, p, dto, id); }
    remove(u, w, p, id) { return this.service.remove(u.id, w, p, id); }
    preview(u, w, p, id) { return this.service.preview(u.id, w, p, id); }
    history(u, w, p, id) { return this.service.history(u.id, w, p, id); }
    retry(u, w, p, id) { return this.service.retry(u.id, w, p, id); }
};
exports.AutomationController = AutomationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, save_automation_rule_dto_1.SaveAutomationRuleDto]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('id')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, save_automation_rule_dto_1.SaveAutomationRuleDto]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/dry-run'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "preview", null);
__decorate([
    (0, common_1.Get)(':id/runs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "history", null);
__decorate([
    (0, common_1.Post)('runs/:runId/retry'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Param)('runId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AutomationController.prototype, "retry", null);
exports.AutomationController = AutomationController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/projects/:projectId/automations'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard, workspace_roles_guard_1.WorkspaceRolesGuard),
    (0, workspace_roles_decorator_1.WorkspaceRoles)(...roles),
    __metadata("design:paramtypes", [automation_service_1.AutomationService])
], AutomationController);
//# sourceMappingURL=automation.controller.js.map