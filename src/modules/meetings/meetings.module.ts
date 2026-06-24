import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { mongodbConfig } from '../../config/mongodb.config';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { MeetingParticipantsController } from './controllers/meeting-participants.controller';
import { MeetingTranscriptsController } from './controllers/meeting-transcripts.controller';
import { MeetingsController } from './controllers/meetings.controller';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { Meeting } from './entities/meeting.entity';
import { MeetingParticipantsRepository } from './repositories/meeting-participants.repository';
import { MeetingsRepository } from './repositories/meetings.repository';
import {
  MeetingTranscript,
  MeetingTranscriptSchema,
} from './schemas/meeting-transcript.schema';
import { MeetingAccessService } from './services/meeting-access.service';
import { MeetingParticipantsService } from './services/meeting-participants.service';
import { MeetingTranscriptsService } from './services/meeting-transcripts.service';
import { MeetingsService } from './services/meetings.service';

const mongoImports = mongodbConfig().enabled
  ? [
      MongooseModule.forFeature([
        { name: MeetingTranscript.name, schema: MeetingTranscriptSchema },
      ]),
    ]
  : [];

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, MeetingParticipant]),
    ...mongoImports,
    ProjectsModule,
    SprintsModule,
    WorkspacesModule,
  ],
  controllers: [
    MeetingsController,
    MeetingParticipantsController,
    MeetingTranscriptsController,
  ],
  providers: [
    MeetingAccessService,
    MeetingsRepository,
    MeetingParticipantsRepository,
    MeetingsService,
    MeetingParticipantsService,
    MeetingTranscriptsService,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [MeetingAccessService, MeetingsRepository],
})
export class MeetingsModule {}
