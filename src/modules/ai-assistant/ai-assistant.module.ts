import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { mongodbConfig } from '../../config/mongodb.config';
import { DailyUpdatesModule } from '../daily-updates/daily-updates.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import {
  AiMeetingSummaryController,
  AiMeetingSummaryDetailController,
} from './controllers/ai-meeting-summary.controller';
import { AiPersonalReportController } from './controllers/ai-personal-report.controller';
import { AiTeamReportController } from './controllers/ai-team-report.controller';
import { AiPromptLog, AiPromptLogSchema } from './schemas/ai-prompt-log.schema';
import { AiReport, AiReportSchema } from './schemas/ai-report.schema';
import {
  MeetingSummary,
  MeetingSummarySchema,
} from './schemas/meeting-summary.schema';
import { AiMeetingSummaryAccessService } from './services/ai-meeting-summary-access.service';
import { AiMeetingSummaryDataBuilderService } from './services/ai-meeting-summary-data-builder.service';
import { AiMeetingSummaryService } from './services/ai-meeting-summary.service';
import { AiPersonalReportService } from './services/ai-personal-report.service';
import { AiProviderService } from './services/ai-provider.service';
import { AiReportAccessService } from './services/ai-report-access.service';
import { AiReportDataBuilderService } from './services/ai-report-data-builder.service';
import { AiTeamReportDataBuilderService } from './services/ai-team-report-data-builder.service';
import { AiTeamReportService } from './services/ai-team-report.service';
import { PromptBuilderService } from './services/prompt-builder.service';

const mongoImports = mongodbConfig().enabled
  ? [
      MongooseModule.forFeature([
        { name: AiReport.name, schema: AiReportSchema },
        { name: AiPromptLog.name, schema: AiPromptLogSchema },
        { name: MeetingSummary.name, schema: MeetingSummarySchema },
      ]),
    ]
  : [];

@Module({
  imports: [
    ...mongoImports,
    DailyUpdatesModule,
    MeetingsModule,
    ProjectsModule,
    SprintsModule,
    TasksModule,
    UsersModule,
    WorkspacesModule,
  ],
  controllers: [
    AiPersonalReportController,
    AiTeamReportController,
    AiMeetingSummaryController,
    AiMeetingSummaryDetailController,
  ],
  providers: [
    AiPersonalReportService,
    AiTeamReportService,
    AiMeetingSummaryService,
    AiProviderService,
    AiMeetingSummaryAccessService,
    AiMeetingSummaryDataBuilderService,
    AiReportAccessService,
    AiReportDataBuilderService,
    AiTeamReportDataBuilderService,
    PromptBuilderService,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
})
export class AiAssistantModule {}
