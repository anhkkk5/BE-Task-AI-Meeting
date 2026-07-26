"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const app_config_1 = __importDefault(require("./config/app.config"));
const database_config_1 = require("./config/database.config");
const mongodb_config_1 = require("./config/mongodb.config");
const redis_module_1 = require("./database/redis/redis.module");
const ai_assistant_module_1 = require("./modules/ai-assistant/ai-assistant.module");
const auth_module_1 = require("./modules/auth/auth.module");
const daily_updates_module_1 = require("./modules/daily-updates/daily-updates.module");
const mail_module_1 = require("./modules/mail/mail.module");
const meetings_module_1 = require("./modules/meetings/meetings.module");
const members_module_1 = require("./modules/members/members.module");
const projects_module_1 = require("./modules/projects/projects.module");
const sprints_module_1 = require("./modules/sprints/sprints.module");
const shift_handovers_module_1 = require("./modules/shift-handovers/shift-handovers.module");
const stats_module_1 = require("./modules/stats/stats.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const users_module_1 = require("./modules/users/users.module");
const workspaces_module_1 = require("./modules/workspaces/workspaces.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [(0, path_1.join)(__dirname, '..', '.env'), '.env'],
                load: [app_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRoot((0, database_config_1.mysqlConfig)()),
            ...((0, mongodb_config_1.mongodbConfig)().enabled
                ? [
                    mongoose_1.MongooseModule.forRoot((0, mongodb_config_1.mongodbConfig)().uri, {
                        lazyConnection: true,
                        serverSelectionTimeoutMS: 5_000,
                    }),
                ]
                : []),
            redis_module_1.RedisModule,
            mail_module_1.MailModule,
            schedule_1.ScheduleModule.forRoot(),
            ai_assistant_module_1.AiAssistantModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            members_module_1.MembersModule,
            projects_module_1.ProjectsModule,
            sprints_module_1.SprintsModule,
            tasks_module_1.TasksModule,
            daily_updates_module_1.DailyUpdatesModule,
            meetings_module_1.MeetingsModule,
            shift_handovers_module_1.ShiftHandoversModule,
            stats_module_1.StatsModule,
            workspaces_module_1.WorkspacesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map