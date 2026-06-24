import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { DailyUpdatesController } from './controllers/daily-updates.controller';
import { DailyUpdate } from './entities/daily-update.entity';
import { DailyUpdatesRepository } from './repositories/daily-updates.repository';
import { DailyUpdateAccessService } from './services/daily-update-access.service';
import { DailyUpdatesService } from './services/daily-updates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyUpdate]),
    ProjectsModule,
    SprintsModule,
    WorkspacesModule,
  ],
  controllers: [DailyUpdatesController],
  providers: [
    DailyUpdateAccessService,
    DailyUpdatesRepository,
    DailyUpdatesService,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [DailyUpdateAccessService, DailyUpdatesRepository],
})
export class DailyUpdatesModule {}
