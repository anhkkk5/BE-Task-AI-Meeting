import { Injectable } from '@nestjs/common';
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
        rawTranscript: transcript.rawTranscript,
        normalizedTranscript: this.normalizeTranscript(
          transcript.rawTranscript,
        ),
        speakers: (transcript.speakers ?? []).map((speaker) => ({
          userId: speaker.userId,
          speakerName: speaker.speakerName,
          text: speaker.text,
        })),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private normalizeTranscript(rawTranscript: string) {
    return rawTranscript
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .join('\n')
      .slice(0, 20000);
  }
}
