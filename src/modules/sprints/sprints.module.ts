import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { ProjectsModule } from '../projects/projects.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { SprintsController } from './controllers/sprints.controller';
import { Sprint } from './entities/sprint.entity';
import { SprintsRepository } from './repositories/sprints.repository';
import { SprintAccessService } from './services/sprint-access.service';
import { SprintsService } from './services/sprints.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sprint]),
    ProjectsModule,
    WorkspacesModule,
  ],
  controllers: [SprintsController],
  providers: [
    SprintAccessService,
    SprintsRepository,
    SprintsService,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [SprintAccessService, SprintsRepository],
})
export class SprintsModule {}
