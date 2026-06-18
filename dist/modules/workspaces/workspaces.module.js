"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workspaces_controller_1 = require("./controllers/workspaces.controller");
const workspace_member_entity_1 = require("./entities/workspace-member.entity");
const workspace_entity_1 = require("./entities/workspace.entity");
const workspace_members_repository_1 = require("./repositories/workspace-members.repository");
const workspaces_repository_1 = require("./repositories/workspaces.repository");
const workspace_access_service_1 = require("./services/workspace-access.service");
const workspaces_service_1 = require("./services/workspaces.service");
let WorkspacesModule = class WorkspacesModule {
};
exports.WorkspacesModule = WorkspacesModule;
exports.WorkspacesModule = WorkspacesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([workspace_entity_1.Workspace, workspace_member_entity_1.WorkspaceMember])],
        controllers: [workspaces_controller_1.WorkspacesController],
        providers: [
            workspaces_repository_1.WorkspacesRepository,
            workspace_members_repository_1.WorkspaceMembersRepository,
            workspace_access_service_1.WorkspaceAccessService,
            workspaces_service_1.WorkspacesService,
        ],
        exports: [workspace_access_service_1.WorkspaceAccessService],
    })
], WorkspacesModule);
//# sourceMappingURL=workspaces.module.js.map