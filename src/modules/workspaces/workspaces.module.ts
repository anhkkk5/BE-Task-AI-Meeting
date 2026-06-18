import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesController } from './controllers/workspaces.controller';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMembersRepository } from './repositories/workspace-members.repository';
import { WorkspacesRepository } from './repositories/workspaces.repository';
import { WorkspaceAccessService } from './services/workspace-access.service';
import { WorkspacesService } from './services/workspaces.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceMember])],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesRepository,
    WorkspaceMembersRepository,
    WorkspaceAccessService,
    WorkspacesService,
  ],
  exports: [WorkspaceAccessService],
})
export class WorkspacesModule {}
