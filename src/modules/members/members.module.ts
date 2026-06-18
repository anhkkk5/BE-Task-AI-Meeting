import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { UsersModule } from '../users/users.module';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { MembersController } from './controllers/members.controller';
import { MembersService } from './services/members.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceMember]),
    UsersModule,
    WorkspacesModule,
  ],
  controllers: [MembersController],
  providers: [MembersService, WorkspaceMemberGuard, WorkspaceRolesGuard],
})
export class MembersModule {}
