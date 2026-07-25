import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { mysqlConfig } from './config/database.config';
import { mongodbConfig } from './config/mongodb.config';
import { RedisModule } from './database/redis/redis.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { AuthModule } from './modules/auth/auth.module';
import { DailyUpdatesModule } from './modules/daily-updates/daily-updates.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { MembersModule } from './modules/members/members.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SprintsModule } from './modules/sprints/sprints.module';
import { ShiftHandoversModule } from './modules/shift-handovers/shift-handovers.module';
import { StatsModule } from './modules/stats/stats.module';
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
      ? [
          MongooseModule.forRoot(mongodbConfig().uri, {
            lazyConnection: true,
            serverSelectionTimeoutMS: 5_000,
          }),
        ]
      : []),
    RedisModule,
    ScheduleModule.forRoot(),
    AiAssistantModule,
    AuthModule,
    UsersModule,
    MembersModule,
    ProjectsModule,
    SprintsModule,
    TasksModule,
    DailyUpdatesModule,
    MeetingsModule,
    ShiftHandoversModule,
    StatsModule,
    WorkspacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
