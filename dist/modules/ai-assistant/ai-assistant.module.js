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
const meetings_module_1 = require("../meetings/meetings.module");
const projects_module_1 = require("../projects/projects.module");
const sprints_module_1 = require("../sprints/sprints.module");
const tasks_module_1 = require("../tasks/tasks.module");
const users_module_1 = require("../users/users.module");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const ai_meeting_summary_controller_1 = require("./controllers/ai-meeting-summary.controller");
const ai_personalized_meeting_summary_controller_1 = require("./controllers/ai-personalized-meeting-summary.controller");
const ai_personal_report_controller_1 = require("./controllers/ai-personal-report.controller");
const ai_team_report_controller_1 = require("./controllers/ai-team-report.controller");
const ai_prompt_log_schema_1 = require("./schemas/ai-prompt-log.schema");
const ai_report_schema_1 = require("./schemas/ai-report.schema");
const meeting_summary_schema_1 = require("./schemas/meeting-summary.schema");
const personalized_meeting_summary_schema_1 = require("./schemas/personalized-meeting-summary.schema");
const ai_meeting_summary_access_service_1 = require("./services/ai-meeting-summary-access.service");
const ai_meeting_summary_data_builder_service_1 = require("./services/ai-meeting-summary-data-builder.service");
const ai_meeting_summary_service_1 = require("./services/ai-meeting-summary.service");
const ai_personalized_meeting_summary_access_service_1 = require("./services/ai-personalized-meeting-summary-access.service");
const ai_personalized_meeting_summary_data_builder_service_1 = require("./services/ai-personalized-meeting-summary-data-builder.service");
const ai_personalized_meeting_summary_service_1 = require("./services/ai-personalized-meeting-summary.service");
const ai_personal_report_service_1 = require("./services/ai-personal-report.service");
const ai_provider_service_1 = require("./services/ai-provider.service");
const ai_report_access_service_1 = require("./services/ai-report-access.service");
const ai_report_data_builder_service_1 = require("./services/ai-report-data-builder.service");
const ai_team_report_data_builder_service_1 = require("./services/ai-team-report-data-builder.service");
const ai_team_report_service_1 = require("./services/ai-team-report.service");
const prompt_builder_service_1 = require("./services/prompt-builder.service");
const mongoImports = (0, mongodb_config_1.mongodbConfig)().enabled
    ? [
        mongoose_1.MongooseModule.forFeature([
            { name: ai_report_schema_1.AiReport.name, schema: ai_report_schema_1.AiReportSchema },
            { name: ai_prompt_log_schema_1.AiPromptLog.name, schema: ai_prompt_log_schema_1.AiPromptLogSchema },
            { name: meeting_summary_schema_1.MeetingSummary.name, schema: meeting_summary_schema_1.MeetingSummarySchema },
            {
                name: personalized_meeting_summary_schema_1.PersonalizedMeetingSummary.name,
                schema: personalized_meeting_summary_schema_1.PersonalizedMeetingSummarySchema,
            },
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
            meetings_module_1.MeetingsModule,
            projects_module_1.ProjectsModule,
            sprints_module_1.SprintsModule,
            tasks_module_1.TasksModule,
            users_module_1.UsersModule,
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [
            ai_personal_report_controller_1.AiPersonalReportController,
            ai_team_report_controller_1.AiTeamReportController,
            ai_meeting_summary_controller_1.AiMeetingSummaryController,
            ai_meeting_summary_controller_1.AiMeetingSummaryDetailController,
            ai_personalized_meeting_summary_controller_1.AiPersonalizedMeetingSummaryController,
            ai_personalized_meeting_summary_controller_1.AiPersonalizedMeetingSummaryProjectController,
        ],
        providers: [
            ai_personal_report_service_1.AiPersonalReportService,
            ai_team_report_service_1.AiTeamReportService,
            ai_meeting_summary_service_1.AiMeetingSummaryService,
            ai_personalized_meeting_summary_service_1.AiPersonalizedMeetingSummaryService,
            ai_provider_service_1.AiProviderService,
            ai_meeting_summary_access_service_1.AiMeetingSummaryAccessService,
            ai_meeting_summary_data_builder_service_1.AiMeetingSummaryDataBuilderService,
            ai_personalized_meeting_summary_access_service_1.AiPersonalizedMeetingSummaryAccessService,
            ai_personalized_meeting_summary_data_builder_service_1.AiPersonalizedMeetingSummaryDataBuilderService,
            ai_report_access_service_1.AiReportAccessService,
            ai_report_data_builder_service_1.AiReportDataBuilderService,
            ai_team_report_data_builder_service_1.AiTeamReportDataBuilderService,
            prompt_builder_service_1.PromptBuilderService,
            workspace_member_guard_1.WorkspaceMemberGuard,
            workspace_roles_guard_1.WorkspaceRolesGuard,
        ],
    })
], AiAssistantModule);
//# sourceMappingURL=ai-assistant.module.js.map