import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ShiftHandoversController } from './controllers/shift-handovers.controller';
import { ShiftHandover } from './entities/shift-handover.entity';
import { ShiftHandoversRepository } from './repositories/shift-handovers.repository';
import { ShiftHandoversService } from './services/shift-handovers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftHandover]),
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [ShiftHandoversController],
  providers: [
    ShiftHandoversRepository,
    ShiftHandoversService,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
})
export class ShiftHandoversModule {}
