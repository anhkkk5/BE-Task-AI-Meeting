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
exports.DailyUpdateAccessService = void 0;
const common_1 = require("@nestjs/common");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const daily_updates_repository_1 = require("../repositories/daily-updates.repository");
const dailyUpdateManagerRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
const dailyUpdateWriterRoles = [
    ...dailyUpdateManagerRoles,
    workspace_role_enum_1.WorkspaceRole.Member,
];
let DailyUpdateAccessService = class DailyUpdateAccessService {
    dailyUpdatesRepository;
    workspaceAccessService;
    constructor(dailyUpdatesRepository, workspaceAccessService) {
        this.dailyUpdatesRepository = dailyUpdatesRepository;
        this.workspaceAccessService = workspaceAccessService;
    }
    getDailyUpdateInProject(dailyUpdateId, projectId) {
        return this.dailyUpdatesRepository.findByIdAndProject(dailyUpdateId, projectId);
    }
    async assertDailyUpdateInProject(dailyUpdateId, projectId) {
        const dailyUpdate = await this.getDailyUpdateInProject(dailyUpdateId, projectId);
        if (!dailyUpdate) {
            throw new common_1.NotFoundException('Daily update not found in this project');
        }
        return dailyUpdate;
    }
    async assertCanViewDailyUpdate(currentUserId, workspaceId, dailyUpdate) {
        if (dailyUpdate.userId === currentUserId) {
            return;
        }
        const role = await this.workspaceAccessService.getUserWorkspaceRole(currentUserId, workspaceId);
        if (role && dailyUpdateManagerRoles.includes(role)) {
            return;
        }
        throw new common_1.ForbiddenException('You can not view this daily update');
    }
    assertCanEditDailyUpdate(currentUserId, dailyUpdate) {
        if (dailyUpdate.userId !== currentUserId) {
            throw new common_1.ForbiddenException('You can not update this daily update');
        }
    }
    async assertCanWriteDailyUpdate(currentUserId, workspaceId) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(currentUserId, workspaceId);
        if (!role) {
            throw new common_1.ForbiddenException('You do not have access to this workspace');
        }
        if (!dailyUpdateWriterRoles.includes(role)) {
            throw new common_1.ForbiddenException('You can not write daily update');
        }
        return role;
    }
    async assertCanViewTeamDailyUpdates(currentUserId, workspaceId) {
        const role = await this.workspaceAccessService.getUserWorkspaceRole(currentUserId, workspaceId);
        if (!role || !dailyUpdateManagerRoles.includes(role)) {
            throw new common_1.ForbiddenException('You can not view team daily updates');
        }
        return role;
    }
};
exports.DailyUpdateAccessService = DailyUpdateAccessService;
exports.DailyUpdateAccessService = DailyUpdateAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [daily_updates_repository_1.DailyUpdatesRepository,
        workspace_access_service_1.WorkspaceAccessService])
], DailyUpdateAccessService);
//# sourceMappingURL=daily-update-access.service.js.map