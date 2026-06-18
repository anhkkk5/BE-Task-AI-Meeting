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
exports.WorkspaceMemberGuard = void 0;
const common_1 = require("@nestjs/common");
const workspace_access_service_1 = require("../../modules/workspaces/services/workspace-access.service");
let WorkspaceMemberGuard = class WorkspaceMemberGuard {
    workspaceAccessService;
    constructor(workspaceAccessService) {
        this.workspaceAccessService = workspaceAccessService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const workspaceId = request.params.workspaceId;
        const userId = request.user?.id;
        if (!userId || !workspaceId) {
            throw new common_1.UnauthorizedException('Unauthorized');
        }
        await this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
        return true;
    }
};
exports.WorkspaceMemberGuard = WorkspaceMemberGuard;
exports.WorkspaceMemberGuard = WorkspaceMemberGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspace_access_service_1.WorkspaceAccessService])
], WorkspaceMemberGuard);
//# sourceMappingURL=workspace-member.guard.js.map