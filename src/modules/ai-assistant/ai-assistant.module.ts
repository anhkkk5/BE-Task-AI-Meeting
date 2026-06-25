import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { mongodbConfig } from '../../config/mongodb.config';
import { DailyUpdatesModule } from '../daily-updates/daily-updates.module';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AiPersonalReportController } from './controllers/ai-personal-report.controller';
import { AiPromptLog, AiPromptLogSchema } from './schemas/ai-prompt-log.schema';
import { AiReport, AiReportSchema } from './schemas/ai-report.schema';
import { AiPersonalReportService } from './services/ai-personal-report.service';
import { AiProviderService } from './services/ai-provider.service';
import { AiReportAccessService } from './services/ai-report-access.service';
import { AiReportDataBuilderService } from './services/ai-report-data-builder.service';
import { PromptBuilderService } from './services/prompt-builder.service';

const mongoImports = mongodbConfig().enabled
  ? [
      MongooseModule.forFeature([
        { name: AiReport.name, schema: AiReportSchema },
        { name: AiPromptLog.name, schema: AiPromptLogSchema },
      ]),
    ]
  : [];

@Module({
  imports: [
    ...mongoImports,
    DailyUpdatesModule,
    ProjectsModule,
    SprintsModule,
    TasksModule,
    UsersModule,
    WorkspacesModule,
  ],
  controllers: [AiPersonalReportController],
  providers: [
    AiPersonalReportService,
    AiProviderService,
    AiReportAccessService,
    AiReportDataBuilderService,
    PromptBuilderService,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
})
export class AiAssistantModule {}
