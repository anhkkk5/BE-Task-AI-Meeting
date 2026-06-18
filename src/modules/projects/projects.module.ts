import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ProjectsController } from './controllers/projects.controller';
import { Project } from './entities/project.entity';
import { ProjectsRepository } from './repositories/projects.repository';
import { ProjectAccessService } from './services/project-access.service';
import { ProjectsService } from './services/projects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), WorkspacesModule],
  controllers: [ProjectsController],
  providers: [
    ProjectAccessService,
    ProjectsRepository,
    ProjectsService,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [ProjectAccessService, ProjectsRepository],
})
export class ProjectsModule {}
