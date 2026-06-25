"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAssistantModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../common/guards/workspace-roles.guard");
const mongodb_config_1 = require("../../config/mongodb.config");
const daily_updates_module_1 = require("../daily-updates/daily-updates.module");
const projects_module_1 = require("../projects/projects.module");
const sprints_module_1 = require("../sprints/sprints.module");
const tasks_module_1 = require("../tasks/tasks.module");
const users_module_1 = require("../users/users.module");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const ai_personal_report_controller_1 = require("./controllers/ai-personal-report.controller");
const ai_prompt_log_schema_1 = require("./schemas/ai-prompt-log.schema");
const ai_report_schema_1 = require("./schemas/ai-report.schema");
const ai_personal_report_service_1 = require("./services/ai-personal-report.service");
const ai_provider_service_1 = require("./services/ai-provider.service");
const ai_report_access_service_1 = require("./services/ai-report-access.service");
const ai_report_data_builder_service_1 = require("./services/ai-report-data-builder.service");
const prompt_builder_service_1 = require("./services/prompt-builder.service");
const mongoImports = (0, mongodb_config_1.mongodbConfig)().enabled
    ? [
        mongoose_1.MongooseModule.forFeature([
            { name: ai_report_schema_1.AiReport.name, schema: ai_report_schema_1.AiReportSchema },
            { name: ai_prompt_log_schema_1.AiPromptLog.name, schema: ai_prompt_log_schema_1.AiPromptLogSchema },
        ]),
    ]
    : [];
let AiAssistantModule = class AiAssistantModule {
};
exports.AiAssistantModule = AiAssistantModule;
exports.AiAssistantModule = AiAssistantModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...mongoImports,
            daily_updates_module_1.DailyUpdatesModule,
            projects_module_1.ProjectsModule,
            sprints_module_1.SprintsModule,
            tasks_module_1.TasksModule,
            users_module_1.UsersModule,
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [ai_personal_report_controller_1.AiPersonalReportController],
        providers: [
            ai_personal_report_service_1.AiPersonalReportService,
            ai_provider_service_1.AiProviderService,
            ai_report_access_service_1.AiReportAccessService,
            ai_report_data_builder_service_1.AiReportDataBuilderService,
            prompt_builder_service_1.PromptBuilderService,
            workspace_member_guard_1.WorkspaceMemberGuard,
            workspace_roles_guard_1.WorkspaceRolesGuard,
        ],
    })
], AiAssistantModule);
//# sourceMappingURL=ai-assistant.module.js.map