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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReportAccessService = void 0;
const common_1 = require("@nestjs/common");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const managerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
const allowedOwnReportRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
    workspace_role_enum_1.WorkspaceRole.Member,
];
let AiReportAccessService = class AiReportAccessService {
    workspaceAccessService;
    constructor(workspaceAccessService) {
        this.workspaceAccessService = workspaceAccessService;
    }
    async assertCanUseOwnReports(userId, workspaceId) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(userId, workspaceId);
        if (!role || !allowedOwnReportRoles.includes(role)) {
            throw new common_1.ForbiddenException('You can not use AI personal reports');
        }
        return role;
    }
    async assertCanManageMemberReports(userId, workspaceId) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(userId, workspaceId);
        if (!role || !managerRoles.includes(role)) {
            throw new common_1.ForbiddenException('You can not manage member personal reports');
        }
        return role;
    }
    async assertCanViewReport(currentUserId, workspaceId, report) {
        const role = await this.assertCanUseOwnReports(currentUserId, workspaceId);
        if (report.userId === currentUserId) {
            return role;
        }
        if (managerRoles.includes(role)) {
            return role;
        }
        throw new common_1.ForbiddenException('You can not view this AI report');
    }
    isManagerRole(role) {
        return Boolean(role && managerRoles.includes(role));
    }
};
exports.AiReportAccessService = AiReportAccessService;
exports.AiReportAccessService = AiReportAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspace_access_service_1.WorkspaceAccessService])
], AiReportAccessService);
//# sourceMappingURL=ai-report-access.service.js.map