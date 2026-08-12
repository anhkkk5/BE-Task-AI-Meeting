"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const system_admin_guard_1 = require("../../common/guards/system-admin.guard");
const user_entity_1 = require("../users/entities/user.entity");
const users_repository_1 = require("../users/repositories/users.repository");
const workspace_entity_1 = require("../workspaces/entities/workspace.entity");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const observability_module_1 = require("../observability/observability.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, workspace_entity_1.Workspace]), observability_module_1.ObservabilityModule],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, users_repository_1.UsersRepository, system_admin_guard_1.SystemAdminGuard],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map