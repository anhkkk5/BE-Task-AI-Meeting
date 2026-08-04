import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAdminGuard } from '../../common/guards/system-admin.guard';
import { User } from '../users/entities/user.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workspace])],
  controllers: [AdminController],
  providers: [AdminService, UsersRepository, SystemAdminGuard],
})
export class AdminModule {}
