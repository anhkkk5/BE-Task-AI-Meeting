"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../common/guards/workspace-roles.guard");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const projects_controller_1 = require("./controllers/projects.controller");
const project_entity_1 = require("./entities/project.entity");
const projects_repository_1 = require("./repositories/projects.repository");
const project_access_service_1 = require("./services/project-access.service");
const projects_service_1 = require("./services/projects.service");
let ProjectsModule = class ProjectsModule {
};
exports.ProjectsModule = ProjectsModule;
exports.ProjectsModule = ProjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([project_entity_1.Project]), workspaces_module_1.WorkspacesModule],
        controllers: [projects_controller_1.ProjectsController],
        providers: [
            project_access_service_1.ProjectAccessService,
            projects_repository_1.ProjectsRepository,
            projects_service_1.ProjectsService,
            workspace_member_guard_1.WorkspaceMemberGuard,
            workspace_roles_guard_1.WorkspaceRolesGuard,
        ],
        exports: [project_access_service_1.ProjectAccessService, projects_repository_1.ProjectsRepository],
    })
], ProjectsModule);
//# sourceMappingURL=projects.module.js.map