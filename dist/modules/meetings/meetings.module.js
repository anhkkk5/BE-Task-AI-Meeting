"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const typeorm_1 = require("@nestjs/typeorm");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../common/guards/workspace-roles.guard");
const mongodb_config_1 = require("../../config/mongodb.config");
const projects_module_1 = require("../projects/projects.module");
const sprints_module_1 = require("../sprints/sprints.module");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const meeting_participants_controller_1 = require("./controllers/meeting-participants.controller");
const meeting_transcripts_controller_1 = require("./controllers/meeting-transcripts.controller");
const meetings_controller_1 = require("./controllers/meetings.controller");
const meeting_participant_entity_1 = require("./entities/meeting-participant.entity");
const meeting_entity_1 = require("./entities/meeting.entity");
const meeting_participants_repository_1 = require("./repositories/meeting-participants.repository");
const meetings_repository_1 = require("./repositories/meetings.repository");
const meeting_transcript_schema_1 = require("./schemas/meeting-transcript.schema");
const meeting_access_service_1 = require("./services/meeting-access.service");
const meeting_participants_service_1 = require("./services/meeting-participants.service");
const meeting_transcripts_service_1 = require("./services/meeting-transcripts.service");
const meetings_service_1 = require("./services/meetings.service");
const mongoImports = (0, mongodb_config_1.mongodbConfig)().enabled
    ? [
        mongoose_1.MongooseModule.forFeature([
            { name: meeting_transcript_schema_1.MeetingTranscript.name, schema: meeting_transcript_schema_1.MeetingTranscriptSchema },
        ]),
    ]
    : [];
let MeetingsModule = class MeetingsModule {
};
exports.MeetingsModule = MeetingsModule;
exports.MeetingsModule = MeetingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([meeting_entity_1.Meeting, meeting_participant_entity_1.MeetingParticipant]),
            ...mongoImports,
            projects_module_1.ProjectsModule,
            sprints_module_1.SprintsModule,
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [
            meetings_controller_1.MeetingsController,
            meeting_participants_controller_1.MeetingParticipantsController,
            meeting_transcripts_controller_1.MeetingTranscriptsController,
        ],
        providers: [
            meeting_access_service_1.MeetingAccessService,
            meetings_repository_1.MeetingsRepository,
            meeting_participants_repository_1.MeetingParticipantsRepository,
            meetings_service_1.MeetingsService,
            meeting_participants_service_1.MeetingParticipantsService,
            meeting_transcripts_service_1.MeetingTranscriptsService,
            workspace_member_guard_1.WorkspaceMemberGuard,
            workspace_roles_guard_1.WorkspaceRolesGuard,
        ],
        exports: [
            meeting_access_service_1.MeetingAccessService,
            meeting_participants_repository_1.MeetingParticipantsRepository,
            meetings_repository_1.MeetingsRepository,
            meeting_transcripts_service_1.MeetingTranscriptsService,
        ],
    })
], MeetingsModule);
//# sourceMappingURL=meetings.module.js.map