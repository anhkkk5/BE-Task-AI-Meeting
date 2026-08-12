"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const workspace_roles_guard_1 = require("../../common/guards/workspace-roles.guard");
const projects_module_1 = require("../projects/projects.module");
const sprints_module_1 = require("../sprints/sprints.module");
const workspaces_module_1 = require("../workspaces/workspaces.module");
const notifications_module_1 = require("../notifications/notifications.module");
const tasks_controller_1 = require("./controllers/tasks.controller");
const task_entity_1 = require("./entities/task.entity");
const task_activity_log_entity_1 = require("./entities/task-activity-log.entity");
const task_comment_entity_1 = require("./entities/task-comment.entity");
const task_dependency_entity_1 = require("./entities/task-dependency.entity");
const task_dependencies_controller_1 = require("./controllers/task-dependencies.controller");
const task_dependencies_repository_1 = require("./repositories/task-dependencies.repository");
const task_dependencies_service_1 = require("./services/task-dependencies.service");
const task_activity_logs_repository_1 = require("./repositories/task-activity-logs.repository");
const task_comments_repository_1 = require("./repositories/task-comments.repository");
const tasks_repository_1 = require("./repositories/tasks.repository");
const task_access_service_1 = require("./services/task-access.service");
const task_code_service_1 = require("./services/task-code.service");
const tasks_service_1 = require("./services/tasks.service");
const task_deadline_notification_scheduler_service_1 = require("./schedulers/task-deadline-notification-scheduler.service");
const workflow_shadow_monitor_scheduler_1 = require("./schedulers/workflow-shadow-monitor.scheduler");
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task, task_activity_log_entity_1.TaskActivityLog, task_comment_entity_1.TaskComment, task_dependency_entity_1.TaskDependency]),
            projects_module_1.ProjectsModule,
            sprints_module_1.SprintsModule,
            workspaces_module_1.WorkspacesModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [tasks_controller_1.TasksController, task_dependencies_controller_1.TaskDependenciesController],
        providers: [
            task_access_service_1.TaskAccessService,
            task_code_service_1.TaskCodeService,
            task_activity_logs_repository_1.TaskActivityLogsRepository,
            task_comments_repository_1.TaskCommentsRepository,
            tasks_repository_1.TasksRepository,
            tasks_service_1.TasksService,
            task_dependencies_repository_1.TaskDependenciesRepository,
            task_dependencies_service_1.TaskDependenciesService,
            task_deadline_notification_scheduler_service_1.TaskDeadlineNotificationSchedulerService,
            workflow_shadow_monitor_scheduler_1.WorkflowShadowMonitorScheduler,
            workspace_member_guard_1.WorkspaceMemberGuard,
            workspace_roles_guard_1.WorkspaceRolesGuard,
        ],
        exports: [task_access_service_1.TaskAccessService, tasks_repository_1.TasksRepository, tasks_service_1.TasksService],
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map