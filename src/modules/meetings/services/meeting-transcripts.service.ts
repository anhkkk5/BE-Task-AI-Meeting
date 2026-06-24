import {
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { SaveMeetingTranscriptDto } from '../dto/save-meeting-transcript.dto';
import {
  MeetingTranscript,
  MeetingTranscriptDocument,
} from '../schemas/meeting-transcript.schema';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingAccessService } from './meeting-access.service';

type MeetingTranscriptWithTimestamps = MeetingTranscriptDocument & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class MeetingTranscriptsService {
  constructor(
    @Optional()
    @InjectModel(MeetingTranscript.name)
    private readonly transcriptModel: Model<MeetingTranscriptDocument> | null,
    private readonly meetingsRepository: MeetingsRepository,
    private readonly meetingAccessService: MeetingAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async saveTranscript(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    dto: SaveMeetingTranscriptDto,
  ) {
    const transcriptModel = this.getTranscriptModel();
    await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
    await this.meetingAccessService.assertUserCanManageMeeting(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );
    this.meetingAccessService.assertMeetingEditable(meeting);

    const payload = {
      meetingId,
      workspaceId,
      projectId,
      sprintId: meeting.sprintId,
      rawTranscript: dto.rawTranscript.trim(),
      speakers:
        dto.speakers?.map((speaker) => ({
          speakerName: speaker.speakerName?.trim() || undefined,
          text: speaker.text.trim(),
          userId: speaker.userId,
        })) ?? [],
      createdBy: currentUserId,
    };

    let transcript: MeetingTranscriptDocument | null = null;

    if (meeting.mongoTranscriptId) {
      transcript = await transcriptModel
        .findByIdAndUpdate(meeting.mongoTranscriptId, payload, {
          new: true,
        })
        .exec();
    }

    if (!transcript) {
      transcript = await transcriptModel.create(payload);
    }

    const transcriptId = this.getTranscriptId(transcript);

    if (meeting.mongoTranscriptId !== transcriptId) {
      await this.meetingsRepository.updateTranscriptId(meeting, transcriptId);
    }

    return {
      success: true,
      message: 'Save meeting transcript successfully',
      data: {
        transcript: this.toTranscriptResponse(transcript),
      },
    };
  }

  async getTranscript(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    const transcriptModel = this.getTranscriptModel();
    await this.meetingAccessService.assertUserCanViewMeeting(
      currentUserId,
      workspaceId,
    );
    await this.projectAccessService.assertProjectInWorkspace(
      projectId,
      workspaceId,
    );
    const meeting = await this.meetingAccessService.assertMeetingInProject(
      meetingId,
      projectId,
    );

    if (!meeting.mongoTranscriptId) {
      throw new NotFoundException('Meeting transcript not found');
    }

    const transcript = await transcriptModel
      .findById(meeting.mongoTranscriptId)
      .exec();

    if (!transcript) {
      throw new NotFoundException('Meeting transcript not found');
    }

    return {
      success: true,
      message: 'Get meeting transcript successfully',
      data: {
        transcript: this.toTranscriptResponse(transcript),
      },
    };
  }

  private getTranscriptModel() {
    if (!this.transcriptModel) {
      throw new ServiceUnavailableException('MongoDB is disabled');
    }

    return this.transcriptModel;
  }

  private getTranscriptId(transcript: MeetingTranscriptDocument) {
    return transcript._id.toString();
  }

  private toTranscriptResponse(transcript: MeetingTranscriptDocument) {
    const stampedTranscript = transcript as MeetingTranscriptWithTimestamps;

    return {
      id: this.getTranscriptId(transcript),
      meetingId: transcript.meetingId,
      workspaceId: transcript.workspaceId,
      projectId: transcript.projectId,
      sprintId: transcript.sprintId ?? null,
      rawTranscript: transcript.rawTranscript,
      speakers: transcript.speakers ?? [],
      createdBy: transcript.createdBy,
      createdAt: stampedTranscript.createdAt,
      updatedAt: stampedTranscript.updatedAt,
    };
  }
}
