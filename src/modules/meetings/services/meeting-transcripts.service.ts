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
import { AppendLiveTranscriptSegmentDto } from '../dto/append-live-transcript-segment.dto';
import { TranscribeAudioChunkDto } from '../dto/transcribe-audio-chunk.dto';
import {
  MeetingTranscript,
  MeetingTranscriptDocument,
  MeetingTranscriptSegment,
} from '../schemas/meeting-transcript.schema';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingAccessService } from './meeting-access.service';
import {
  GroqTranscriptionService,
  MeetingAudioFile,
} from './groq-transcription.service';

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
    private readonly meetingParticipantsRepository: MeetingParticipantsRepository,
    private readonly meetingAccessService: MeetingAccessService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly groqTranscriptionService: GroqTranscriptionService,
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
      liveSegments: [],
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

  async appendLiveSegment(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    dto: AppendLiveTranscriptSegmentDto,
  ) {
    const { meeting, speakerName } = await this.getAppendContext(
      currentUserId,
      workspaceId,
      projectId,
      meetingId,
    );
    const segment: MeetingTranscriptSegment = {
      userId: currentUserId,
      speakerName,
      text: dto.text.trim(),
      startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
      endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
      confidence: dto.confidence ?? null,
      source: dto.source?.trim() || 'browser-speech',
    };
    const transcript = await this.persistSegment(
      meeting,
      currentUserId,
      workspaceId,
      projectId,
      segment,
    );

    return {
      success: true,
      message: 'Append live transcript segment successfully',
      data: {
        segment,
        transcript: this.toTranscriptResponse(transcript),
      },
    };
  }

  async appendAudioChunk(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
    audio: MeetingAudioFile,
    dto: TranscribeAudioChunkDto,
  ) {
    const { meeting, speakerName } = await this.getAppendContext(
      currentUserId,
      workspaceId,
      projectId,
      meetingId,
    );
    const transcriptModel = this.getTranscriptModel();
    let existingTranscript: MeetingTranscriptDocument | null = null;

    if (meeting.mongoTranscriptId) {
      existingTranscript = await transcriptModel
        .findById(meeting.mongoTranscriptId)
        .exec();
      const existingSegment = existingTranscript?.liveSegments?.find(
        (segment) =>
          segment.userId === currentUserId && segment.chunkId === dto.chunkId,
      );

      if (existingSegment && existingTranscript) {
        return {
          success: true,
          message: 'Doan am thanh da duoc xu ly truoc do',
          data: {
            segment: existingSegment,
            transcript: this.toTranscriptResponse(existingTranscript),
          },
        };
      }
    }

    const transcription =
      await this.groqTranscriptionService.transcribe(audio);
    const segment: MeetingTranscriptSegment = {
      chunkId: dto.chunkId,
      userId: currentUserId,
      speakerName,
      text: transcription.text,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
      endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
      confidence: null,
      source: `groq:${transcription.model}`,
    };
    const transcript = await this.persistSegment(
      meeting,
      currentUserId,
      workspaceId,
      projectId,
      segment,
      existingTranscript,
    );

    return {
      success: true,
      message: 'Chuyen am thanh thanh transcript thanh cong',
      data: {
        segment,
        transcript: this.toTranscriptResponse(transcript),
      },
    };
  }

  async findTranscriptForMeeting(meeting: {
    mongoTranscriptId: string | null;
  }) {
    const transcriptModel = this.getTranscriptModel();

    if (!meeting.mongoTranscriptId) {
      throw new NotFoundException('Meeting transcript not found');
    }

    const transcript = await transcriptModel
      .findById(meeting.mongoTranscriptId)
      .exec();

    if (!transcript) {
      throw new NotFoundException('Meeting transcript not found');
    }

    return transcript;
  }

  private getTranscriptModel() {
    if (!this.transcriptModel) {
      throw new ServiceUnavailableException('MongoDB is disabled');
    }

    return this.transcriptModel;
  }

  private async getAppendContext(
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    meetingId: string,
  ) {
    this.getTranscriptModel();
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

    if (meeting.workspaceId !== workspaceId) {
      throw new NotFoundException('Meeting transcript not found');
    }

    const participant =
      await this.meetingParticipantsRepository.findByMeetingAndUser(
        meetingId,
        currentUserId,
      );

    return {
      meeting,
      speakerName:
        participant?.user?.fullName ||
        participant?.user?.email ||
        currentUserId,
    };
  }

  private async persistSegment(
    meeting: Awaited<
      ReturnType<MeetingAccessService['assertMeetingInProject']>
    >,
    currentUserId: string,
    workspaceId: string,
    projectId: string,
    segment: MeetingTranscriptSegment,
    loadedTranscript: MeetingTranscriptDocument | null = null,
  ) {
    const transcriptModel = this.getTranscriptModel();
    let transcript = loadedTranscript;

    if (!transcript && meeting.mongoTranscriptId) {
      transcript = await transcriptModel
        .findById(meeting.mongoTranscriptId)
        .exec();
    }

    if (!transcript) {
      transcript = await transcriptModel.create({
        meetingId: meeting.id,
        workspaceId,
        projectId,
        sprintId: meeting.sprintId,
        rawTranscript: this.buildRawTranscript([segment]),
        speakers: this.buildSpeakersFromSegments([segment]),
        liveSegments: [segment],
        createdBy: currentUserId,
      });
      await this.meetingsRepository.updateTranscriptId(
        meeting,
        this.getTranscriptId(transcript),
      );
    } else {
      transcript.liveSegments = [
        ...(transcript.liveSegments ?? []),
        segment,
      ].slice(-1000);
      transcript.speakers = this.buildSpeakersFromSegments(
        transcript.liveSegments,
      );
      transcript.rawTranscript = this.buildRawTranscript(
        transcript.liveSegments,
      );
      await transcript.save();
    }

    return transcript;
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
      liveSegments: transcript.liveSegments ?? [],
      createdBy: transcript.createdBy,
      createdAt: stampedTranscript.createdAt,
      updatedAt: stampedTranscript.updatedAt,
    };
  }

  private buildSpeakersFromSegments(segments: MeetingTranscriptSegment[]) {
    return segments.map((segment) => ({
      userId: segment.userId,
      speakerName: segment.speakerName,
      text: segment.text,
    }));
  }

  private buildRawTranscript(segments: MeetingTranscriptSegment[]) {
    return segments
      .slice()
      .sort(
        (left, right) =>
          new Date(left.startedAt).getTime() -
          new Date(right.startedAt).getTime(),
      )
      .map((segment) =>
        [segment.speakerName || 'Unknown', segment.text]
          .filter(Boolean)
          .join(': '),
      )
      .join('\n');
  }
}
