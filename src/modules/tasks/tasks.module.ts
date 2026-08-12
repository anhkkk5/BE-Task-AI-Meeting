import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TasksController } from './controllers/tasks.controller';
import { Task } from './entities/task.entity';
import { TaskActivityLog } from './entities/task-activity-log.entity';
import { TaskComment } from './entities/task-comment.entity';
import { TaskDependency } from './entities/task-dependency.entity';
import { TaskDependenciesController } from './controllers/task-dependencies.controller';
import { TaskDependenciesRepository } from './repositories/task-dependencies.repository';
import { TaskDependenciesService } from './services/task-dependencies.service';
import { TaskActivityLogsRepository } from './repositories/task-activity-logs.repository';
import { TaskCommentsRepository } from './repositories/task-comments.repository';
import { TasksRepository } from './repositories/tasks.repository';
import { TaskAccessService } from './services/task-access.service';
import { TaskCodeService } from './services/task-code.service';
import { TasksService } from './services/tasks.service';
import { TaskDeadlineNotificationSchedulerService } from './schedulers/task-deadline-notification-scheduler.service';
import { WorkflowShadowMonitorScheduler } from './schedulers/workflow-shadow-monitor.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskActivityLog, TaskComment, TaskDependency]),
    ProjectsModule,
    SprintsModule,
    WorkspacesModule,
    NotificationsModule,
  ],
  controllers: [TasksController, TaskDependenciesController],
  providers: [
    TaskAccessService,
    TaskCodeService,
    TaskActivityLogsRepository,
    TaskCommentsRepository,
    TasksRepository,
    TasksService,
    TaskDependenciesRepository,
    TaskDependenciesService,
    TaskDeadlineNotificationSchedulerService,
    WorkflowShadowMonitorScheduler,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [TaskAccessService, TasksRepository, TasksService],
})
export class TasksModule {}
