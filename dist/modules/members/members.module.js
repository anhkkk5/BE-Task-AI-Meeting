"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../common/guards/workspace-roles.guard");
const users_module_1 = require("../users/users.module");
const workspace_member_entity_1 = require("../workspaces/entities/workspace-member.entity");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const members_controller_1 = require("./controllers/members.controller");
const members_service_1 = require("./services/members.service");
let MembersModule = class MembersModule {
};
exports.MembersModule = MembersModule;
exports.MembersModule = MembersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([workspace_member_entity_1.WorkspaceMember]),
            users_module_1.UsersModule,
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [members_controller_1.MembersController],
        providers: [members_service_1.MembersService, workspace_member_guard_1.WorkspaceMemberGuard, workspace_roles_guard_1.WorkspaceRolesGuard],
    })
], MembersModule);
//# sourceMappingURL=members.module.js.map