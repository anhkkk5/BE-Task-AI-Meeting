import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { mongodbConfig } from '../../config/mongodb.config';
import { DailyUpdatesModule } from '../daily-updates/daily-updates.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { ProjectsModule } from '../projects/projects.module';
import { ShiftHandoversModule } from '../shift-handovers/shift-handovers.module';
import { SprintsModule } from '../sprints/sprints.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import {
  AiMeetingSummaryController,
  AiMeetingSummaryDetailController,
} from './controllers/ai-meeting-summary.controller';
import {
  AiPersonalizedMeetingSummaryController,
  AiPersonalizedMeetingSummaryProjectController,
} from './controllers/ai-personalized-meeting-summary.controller';
import { AiDraftController } from './controllers/ai-draft.controller';
import { AiPersonalReportController } from './controllers/ai-personal-report.controller';
import { AiProjectAssistantController } from './controllers/ai-project-assistant.controller';
import { AiAgileFlowAssistantController } from './controllers/ai-agileflow-assistant.controller';
import { AiTeamReportController } from './controllers/ai-team-report.controller';
import { AiPromptLog, AiPromptLogSchema } from './schemas/ai-prompt-log.schema';
import { AiReport, AiReportSchema } from './schemas/ai-report.schema';
import {
  MeetingSummary,
  MeetingSummarySchema,
} from './schemas/meeting-summary.schema';
import {
  PersonalizedMeetingSummary,
  PersonalizedMeetingSummarySchema,
} from './schemas/personalized-meeting-summary.schema';
import { AiMeetingSummaryAccessService } from './services/ai-meeting-summary-access.service';
import { AiMeetingSummaryDataBuilderService } from './services/ai-meeting-summary-data-builder.service';
import { AiMeetingSummaryService } from './services/ai-meeting-summary.service';
import { AiPersonalizedMeetingSummaryAccessService } from './services/ai-personalized-meeting-summary-access.service';
import { AiPersonalizedMeetingSummaryDataBuilderService } from './services/ai-personalized-meeting-summary-data-builder.service';
import { AiPersonalizedMeetingSummaryService } from './services/ai-personalized-meeting-summary.service';
import { AiDraftService } from './services/ai-draft.service';
import { AiPersonalReportService } from './services/ai-personal-report.service';
import { AiProjectAssistantService } from './services/ai-project-assistant.service';
import { AiAgileFlowAssistantService } from './services/ai-agileflow-assistant.service';
import { AiProviderService } from './services/ai-provider.service';
import { AiReportAccessService } from './services/ai-report-access.service';
import { AiReportDataBuilderService } from './services/ai-report-data-builder.service';
import { AiReportEventsService } from './services/ai-report-events.service';
import { AiTeamReportDataBuilderService } from './services/ai-team-report-data-builder.service';
import { AiTeamReportService } from './services/ai-team-report.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { AutoMeetingSummaryListener } from './listeners/auto-meeting-summary.listener';
import { TeamReportNotificationListener } from './listeners/team-report-notification.listener';
import { AiDailyReportSchedulerService } from './schedulers/ai-daily-report-scheduler.service';
import { AiDailyUpdateSchedulerService } from './schedulers/ai-daily-update-scheduler.service';
import { MeetingActionItemReview } from './entities/meeting-action-item-review.entity';
import { MeetingActionItemReviewsRepository } from './repositories/meeting-action-item-reviews.repository';
import { AiMeetingActionItemReviewService } from './services/ai-meeting-action-item-review.service';
import { TeamReportActionItem } from './entities/team-report-action-item.entity';
import { TeamReportActionItemsRepository } from './repositories/team-report-action-items.repository';
import { AiTeamReportActionItemService } from './services/ai-team-report-action-item.service';
import { AiTeamReportActionItemController } from './controllers/ai-team-report-action-item.controller';
import {
  MeetingTranscript,
  MeetingTranscriptSchema,
} from '../meetings/schemas/meeting-transcript.schema';
import {
  ProjectAssistantMessage,
  ProjectAssistantMessageSchema,
} from './schemas/project-assistant-message.schema';
import { MongodbObservabilityScheduler } from './schedulers/mongodb-observability.scheduler';
import { NotificationsModule } from '../notifications/notifications.module';

const mongoImports = mongodbConfig().enabled
  ? [
      MongooseModule.forFeature([
        { name: AiReport.name, schema: AiReportSchema },
        { name: AiPromptLog.name, schema: AiPromptLogSchema },
        { name: MeetingSummary.name, schema: MeetingSummarySchema },
        { name: MeetingTranscript.name, schema: MeetingTranscriptSchema },
        {
          name: ProjectAssistantMessage.name,
          schema: ProjectAssistantMessageSchema,
        },
        {
          name: PersonalizedMeetingSummary.name,
          schema: PersonalizedMeetingSummarySchema,
        },
      ]),
    ]
  : [];

@Module({
  imports: [
    ...mongoImports,
    TypeOrmModule.forFeature([MeetingActionItemReview, TeamReportActionItem]),
    DailyUpdatesModule,
    MeetingsModule,
    ProjectsModule,
    ShiftHandoversModule,
    SprintsModule,
    TasksModule,
    UsersModule,
    WorkspacesModule,
    NotificationsModule,
  ],
  controllers: [
    AiDraftController,
    AiPersonalReportController,
    AiProjectAssistantController,
    AiAgileFlowAssistantController,
    AiTeamReportController,
    AiTeamReportActionItemController,
    AiMeetingSummaryController,
    AiMeetingSummaryDetailController,
    AiPersonalizedMeetingSummaryController,
    AiPersonalizedMeetingSummaryProjectController,
  ],
  providers: [
    AiDraftService,
    AiPersonalReportService,
    AiProjectAssistantService,
    AiAgileFlowAssistantService,
    AiTeamReportService,
    AiMeetingSummaryService,
    AiPersonalizedMeetingSummaryService,
    AiProviderService,
    AiMeetingSummaryAccessService,
    AiMeetingSummaryDataBuilderService,
    AiPersonalizedMeetingSummaryAccessService,
    AiPersonalizedMeetingSummaryDataBuilderService,
    AiReportAccessService,
    AiReportDataBuilderService,
    AiReportEventsService,
    AiTeamReportDataBuilderService,
    PromptBuilderService,
    AutoMeetingSummaryListener,
    TeamReportNotificationListener,
    AiDailyReportSchedulerService,
    AiDailyUpdateSchedulerService,
    AiMeetingActionItemReviewService,
    MeetingActionItemReviewsRepository,
    AiTeamReportActionItemService,
    TeamReportActionItemsRepository,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
    ...(mongodbConfig().enabled ? [MongodbObservabilityScheduler] : []),
  ],
})
export class AiAssistantModule {}
