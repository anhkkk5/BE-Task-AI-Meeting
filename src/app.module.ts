import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { mysqlConfig } from './config/database.config';
import { mongodbConfig } from './config/mongodb.config';
import { RedisModule } from './database/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { DailyUpdatesModule } from './modules/daily-updates/daily-updates.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { MembersModule } from './modules/members/members.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SprintsModule } from './modules/sprints/sprints.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '.env'), '.env'],
      load: [appConfig],
    }),
    TypeOrmModule.forRoot(mysqlConfig()),
    ...(mongodbConfig().enabled
      ? [MongooseModule.forRoot(mongodbConfig().uri)]
      : []),
    RedisModule,
    AuthModule,
    UsersModule,
    MembersModule,
    ProjectsModule,
    SprintsModule,
    TasksModule,
    DailyUpdatesModule,
    MeetingsModule,
    WorkspacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
