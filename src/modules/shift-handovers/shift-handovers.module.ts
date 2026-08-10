import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ShiftHandoversController } from './controllers/shift-handovers.controller';
import { ShiftHandover } from './entities/shift-handover.entity';
import { HandoverNotificationListener } from './listeners/handover-notification.listener';
import { ShiftHandoversRepository } from './repositories/shift-handovers.repository';
import { HandoverEventsService } from './services/handover-events.service';
import { ShiftHandoversService } from './services/shift-handovers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftHandover]),
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    NotificationsModule,
  ],
  controllers: [ShiftHandoversController],
  providers: [
    ShiftHandoversRepository,
    ShiftHandoversService,
    HandoverEventsService,
    HandoverNotificationListener,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [ShiftHandoversRepository],
})
export class ShiftHandoversModule {}
