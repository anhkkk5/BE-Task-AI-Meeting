"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const meeting_entity_1 = require("../meetings/entities/meeting.entity");
const project_entity_1 = require("../projects/entities/project.entity");
const sprint_entity_1 = require("../sprints/entities/sprint.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const workspace_member_entity_1 = require("../workspaces/entities/workspace-member.entity");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const stats_controller_1 = require("./controllers/stats.controller");
const stats_repository_1 = require("./repositories/stats.repository");
const stats_service_1 = require("./services/stats.service");
let StatsModule = class StatsModule {
};
exports.StatsModule = StatsModule;
exports.StatsModule = StatsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([workspace_member_entity_1.WorkspaceMember, project_entity_1.Project, task_entity_1.Task, sprint_entity_1.Sprint, meeting_entity_1.Meeting]),
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [stats_controller_1.StatsController],
        providers: [stats_repository_1.StatsRepository, stats_service_1.StatsService],
    })
], StatsModule);
//# sourceMappingURL=stats.module.js.map