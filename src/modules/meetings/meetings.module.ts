import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { WorkspaceRolesGuard } from '../../common/guards/workspace-roles.guard';
import { mongodbConfig } from '../../config/mongodb.config';
import { ProjectsModule } from '../projects/projects.module';
import { SprintsModule } from '../sprints/sprints.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { MeetingParticipantsController } from './controllers/meeting-participants.controller';
import { MeetingTranscriptsController } from './controllers/meeting-transcripts.controller';
import { MeetingsController } from './controllers/meetings.controller';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { Meeting } from './entities/meeting.entity';
import { MeetingSignalingGateway } from './gateways/meeting-signaling.gateway';
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
import { GroqTranscriptionService } from './services/groq-transcription.service';

const mongoImports = mongodbConfig().enabled
  ? [
      MongooseModule.forFeature([
        { name: MeetingTranscript.name, schema: MeetingTranscriptSchema },
      ]),
    ]
  : [];

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Meeting, MeetingParticipant]),
    ...mongoImports,
    ProjectsModule,
    SprintsModule,
    UsersModule,
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
    GroqTranscriptionService,
    MeetingSignalingGateway,
    WorkspaceMemberGuard,
    WorkspaceRolesGuard,
  ],
  exports: [
    MeetingAccessService,
    MeetingParticipantsRepository,
    MeetingsRepository,
    MeetingTranscriptsService,
  ],
})
export class MeetingsModule {}
