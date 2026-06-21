import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { TasksController } from './controllers/tasks.controller';
import { Task } from './entities/task.entity';
import { TasksRepository } from './repositories/tasks.repository';
import { TaskAccessService } from './services/task-access.service';
import { TaskCodeService } from './services/task-code.service';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    ProjectsModule,
    SprintsModule,
    WorkspacesModule,
  ],
  controllers: [TasksController],
  providers: [
    TaskAccessService,
    TaskCodeService,
    TasksRepository,
    TasksService,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [TaskAccessService, TasksRepository],
})
export class TasksModule {}
