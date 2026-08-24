import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { AiUserPreference } from './entities/ai-user-preference.entity';
import { AiUserPreferencesService } from './services/ai-user-preferences.service';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';
import { AvatarUploadService } from './services/avatar-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, AiUserPreference])],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersService,
    AiUserPreferencesService,
    AvatarUploadService,
  ],
  exports: [UsersService, AiUserPreferencesService],
})
export class UsersModule {}
