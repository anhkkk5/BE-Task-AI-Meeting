"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftHandoversModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../common/guards/workspace-roles.guard");
const projects_module_1 = require("../projects/projects.module");
const tasks_module_1 = require("../tasks/tasks.module");
const notifications_module_1 = require("../notifications/notifications.module");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const shift_handovers_controller_1 = require("./controllers/shift-handovers.controller");
const shift_handover_entity_1 = require("./entities/shift-handover.entity");
const handover_notification_listener_1 = require("./listeners/handover-notification.listener");
const shift_handovers_repository_1 = require("./repositories/shift-handovers.repository");
const handover_events_service_1 = require("./services/handover-events.service");
const shift_handovers_service_1 = require("./services/shift-handovers.service");
let ShiftHandoversModule = class ShiftHandoversModule {
};
exports.ShiftHandoversModule = ShiftHandoversModule;
exports.ShiftHandoversModule = ShiftHandoversModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shift_handover_entity_1.ShiftHandover]),
            workspaces_module_1.WorkspacesModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [shift_handovers_controller_1.ShiftHandoversController],
        providers: [
            shift_handovers_repository_1.ShiftHandoversRepository,
            shift_handovers_service_1.ShiftHandoversService,
            handover_events_service_1.HandoverEventsService,
            handover_notification_listener_1.HandoverNotificationListener,
            workspace_member_guard_1.WorkspaceMemberGuard,
            workspace_roles_guard_1.WorkspaceRolesGuard,
        ],
        exports: [shift_handovers_repository_1.ShiftHandoversRepository],
    })
], ShiftHandoversModule);
//# sourceMappingURL=shift-handovers.module.js.map