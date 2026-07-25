import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from '../meetings/entities/meeting.entity';
import { Project } from '../projects/entities/project.entity';
import { Sprint } from '../sprints/entities/sprint.entity';
import { Task } from '../tasks/entities/task.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { StatsController } from './controllers/stats.controller';
import { StatsRepository } from './repositories/stats.repository';
import { StatsService } from './services/stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceMember,
      Project,
      Task,
      Sprint,
      Meeting,
    ]),
    // WorkspacesModule export WorkspaceAccessService va WorkspaceMembersRepository,
    // dung lai de dam bao chi dem du lieu cua workspace ma user co quyen.
    WorkspacesModule,
  ],
  controllers: [StatsController],
  providers: [StatsRepository, StatsService],
})
export class StatsModule {}
