"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../common/guards/workspace-roles.guard");
const projects_module_1 = require("../projects/projects.module");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const sprints_controller_1 = require("./controllers/sprints.controller");
const sprint_entity_1 = require("./entities/sprint.entity");
const sprints_repository_1 = require("./repositories/sprints.repository");
const sprint_access_service_1 = require("./services/sprint-access.service");
const sprints_service_1 = require("./services/sprints.service");
let SprintsModule = class SprintsModule {
};
exports.SprintsModule = SprintsModule;
exports.SprintsModule = SprintsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([sprint_entity_1.Sprint]),
            projects_module_1.ProjectsModule,
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [sprints_controller_1.SprintsController],
        providers: [
            sprint_access_service_1.SprintAccessService,
            sprints_repository_1.SprintsRepository,
            sprints_service_1.SprintsService,
            workspace_member_guard_1.WorkspaceMemberGuard,
            workspace_roles_guard_1.WorkspaceRolesGuard,
        ],
        exports: [sprint_access_service_1.SprintAccessService, sprints_repository_1.SprintsRepository],
    })
], SprintsModule);
//# sourceMappingURL=sprints.module.js.map