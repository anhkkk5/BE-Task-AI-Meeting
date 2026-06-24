"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyUpdatesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../common/guards/workspace-roles.guard");
const projects_module_1 = require("../projects/projects.module");
const sprints_module_1 = require("../sprints/sprints.module");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const daily_updates_controller_1 = require("./controllers/daily-updates.controller");
const daily_update_entity_1 = require("./entities/daily-update.entity");
const daily_updates_repository_1 = require("./repositories/daily-updates.repository");
const daily_update_access_service_1 = require("./services/daily-update-access.service");
const daily_updates_service_1 = require("./services/daily-updates.service");
let DailyUpdatesModule = class DailyUpdatesModule {
};
exports.DailyUpdatesModule = DailyUpdatesModule;
exports.DailyUpdatesModule = DailyUpdatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([daily_update_entity_1.DailyUpdate]),
            projects_module_1.ProjectsModule,
            sprints_module_1.SprintsModule,
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [daily_updates_controller_1.DailyUpdatesController],
        providers: [
            daily_update_access_service_1.DailyUpdateAccessService,
            daily_updates_repository_1.DailyUpdatesRepository,
            daily_updates_service_1.DailyUpdatesService,
            workspace_member_guard_1.WorkspaceMemberGuard,
            workspace_roles_guard_1.WorkspaceRolesGuard,
        ],
        exports: [daily_update_access_service_1.DailyUpdateAccessService, daily_updates_repository_1.DailyUpdatesRepository],
    })
], DailyUpdatesModule);
//# sourceMappingURL=daily-updates.module.js.map