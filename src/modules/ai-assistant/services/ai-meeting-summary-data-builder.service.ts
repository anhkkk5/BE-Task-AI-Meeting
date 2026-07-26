import { Injectable } from '@nestjs/common';
import {
  cleanTranscriptLines,
  isNoiseTranscript,
} from '../../../common/utils/transcript-noise.util';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { MeetingTranscriptsService } from '../../meetings/services/meeting-transcripts.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';

export type MeetingSummaryInputData = {
  workspace: {
    id: string;
  };
  project: {
    id: string;
    name: string;
    keyCode: string;
    status: string;
  };
  meeting: {
    id: string;
    title: string;
    description: string | null;
    meetingType: string;
    meetingDate: string;
    status: string;
    startTime: Date | null;
    endTime: Date | null;
  };
  sprint: {
    id: string;
    name: string;
    status: string;
    startDate?: string;
    endDate?: string;
  } | null;
  participants: {
    userId: string;
    fullName: string | null;
    email: string | null;
    role: string;
    attended: boolean;
  }[];
  transcript: {
    id: string;
    rawTranscript: string;
    normalizedTranscript: string;
    speakers: {
      userId?: string;
      speakerName?: string;
      text: string;
    }[];
  };
  generatedAt: string;
};

@Injectable()
export class AiMeetingSummaryDataBuilderService {
  constructor(
    private readonly meetingParticipantsRepository: MeetingParticipantsRepository,
    private readonly meetingTranscriptsService: MeetingTranscriptsService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async buildMeetingSummaryInput(params: {
    workspaceId: string;
    projectId: string;
    meeting: Meeting;
  }): Promise<MeetingSummaryInputData> {
    const [project, participants, transcript] = await Promise.all([
      this.projectAccessService.assertProjectInWorkspace(
        params.projectId,
        params.workspaceId,
      ),
      this.meetingParticipantsRepository.findByMeeting(params.meeting.id),
      this.meetingTranscriptsService.findTranscriptForMeeting(params.meeting),
    ]);

    return {
      workspace: {
        id: params.workspaceId,
      },
      project: {
        id: project.id,
        name: project.name,
        keyCode: project.keyCode,
        status: project.status,
      },
      meeting: {
        id: params.meeting.id,
        title: params.meeting.title,
        description: params.meeting.description,
        meetingType: params.meeting.meetingType,
        meetingDate: params.meeting.meetingDate,
        status: params.meeting.status,
        startTime: params.meeting.startTime,
        endTime: params.meeting.endTime,
      },
      sprint: params.meeting.sprint
        ? {
            id: params.meeting.sprint.id,
            name: params.meeting.sprint.name,
            status: params.meeting.sprint.status,
            startDate: params.meeting.sprint.startDate,
            endDate: params.meeting.sprint.endDate,
          }
        : null,
      participants: participants.map((participant) => ({
        userId: participant.userId,
        fullName: participant.user?.fullName ?? null,
        email: participant.user?.email ?? null,
        role: participant.role,
        attended: participant.attended,
      })),
      transcript: {
        id: transcript._id.toString(),
        rawTranscript: this.cleanRawTranscript(transcript.rawTranscript),
        normalizedTranscript: this.normalizeTranscript(
          transcript.rawTranscript,
        ),
        speakers: (transcript.speakers ?? [])
          .filter((speaker) => !isNoiseTranscript(speaker.text))
          .map((speaker) => ({
            userId: speaker.userId,
            speakerName: this.resolveSpeakerName(speaker, participants),
            text: speaker.text,
          })),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Transcript cu co the luu userId o speakerName. Doi chieu voi participants
   * de prompt va UI luon nhan duoc ho ten thay vi UUID.
   */
  private resolveSpeakerName(
    speaker: { userId?: string; speakerName?: string },
    participants: {
      userId: string;
      user?: { fullName?: string | null; email?: string | null } | null;
    }[],
  ) {
    const participant = participants.find(
      (item) =>
        item.userId === speaker.userId || item.userId === speaker.speakerName,
    );
    const fullName = participant?.user?.fullName?.trim();

    if (fullName) return fullName;

    const email = participant?.user?.email?.trim();

    if (email) return email.split('@')[0];

    const speakerName = speaker.speakerName?.trim();

    if (speakerName && !this.isUuidLike(speakerName)) return speakerName;

    return 'Thành viên';
  }

  private isUuidLike(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private cleanRawTranscript(rawTranscript: string) {
    return cleanTranscriptLines(rawTranscript.split(/\r?\n/)).join('\n');
  }

  private normalizeTranscript(rawTranscript: string) {
    const lines = rawTranscript
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/\s+/g, ' '))
      .filter(Boolean);

    return cleanTranscriptLines(lines).join('\n').slice(0, 20000);
  }
}
