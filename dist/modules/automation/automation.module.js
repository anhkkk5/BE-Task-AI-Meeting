"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notifications_module_1 = require("../notifications/notifications.module");
const projects_module_1 = require("../projects/projects.module");
const tasks_module_1 = require("../tasks/tasks.module");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const automation_controller_1 = require("./controllers/automation.controller");
const automation_rule_entity_1 = require("./entities/automation-rule.entity");
const automation_run_entity_1 = require("./entities/automation-run.entity");
const automation_repository_1 = require("./repositories/automation.repository");
const automation_scheduler_1 = require("./schedulers/automation.scheduler");
const automation_service_1 = require("./services/automation.service");
let AutomationModule = class AutomationModule {
};
exports.AutomationModule = AutomationModule;
exports.AutomationModule = AutomationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([automation_rule_entity_1.AutomationRule, automation_run_entity_1.AutomationRun]),
            tasks_module_1.TasksModule,
            notifications_module_1.NotificationsModule,
            projects_module_1.ProjectsModule,
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [automation_controller_1.AutomationController],
        providers: [automation_repository_1.AutomationRepository, automation_service_1.AutomationService, automation_scheduler_1.AutomationScheduler],
    })
], AutomationModule);
//# sourceMappingURL=automation.module.js.map