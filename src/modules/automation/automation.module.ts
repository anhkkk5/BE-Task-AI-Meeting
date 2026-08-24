import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AutomationController } from './controllers/automation.controller';
import { AutomationRule } from './entities/automation-rule.entity';
import { AutomationRun } from './entities/automation-run.entity';
import { AutomationRepository } from './repositories/automation.repository';
import { AutomationScheduler } from './schedulers/automation.scheduler';
import { AutomationService } from './services/automation.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([AutomationRule, AutomationRun]),
    TasksModule,
    NotificationsModule,
    ProjectsModule,
    WorkspacesModule,
  ],
  controllers: [AutomationController],
  providers: [AutomationRepository, AutomationService, AutomationScheduler],
})
export class AutomationModule {}
