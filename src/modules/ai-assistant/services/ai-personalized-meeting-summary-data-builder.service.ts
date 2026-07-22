import { Injectable, NotFoundException } from '@nestjs/common';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { MeetingTranscriptsService } from '../../meetings/services/meeting-transcripts.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { UsersService } from '../../users/services/users.service';
import {
  MeetingSummaryActionItem,
  MeetingSummaryDocument,
} from '../schemas/meeting-summary.schema';

export type PersonalizedMeetingSummaryInputData = {
  workspace: {
    id: string;
  };
  project: {
    id: string;
    name: string;
    keyCode: string;
    status: string;
  };
  sprint: {
    id: string;
    name: string;
    status: string;
    startDate?: string;
    endDate?: string;
  } | null;
  meeting: {
    id: string;
    title: string;
    description: string | null;
    meetingType: string;
    meetingDate: string;
    status: string;
  };
  targetUser: {
    userId: string;
    fullName: string;
    email: string;
  };
  participants: {
    userId: string;
    fullName: string | null;
    email: string | null;
    role: string;
    attended: boolean;
  }[];
  meetingSummary: {
    id: string;
    title: string;
    summary: string;
    keyPoints: string[];
    decisions: string[];
    actionItems: MeetingSummaryActionItem[];
    risks: string[];
    openQuestions: string[];
    nextSteps: string[];
  };
  relatedTranscriptSnippets: string[];
  targetActionItems: MeetingSummaryActionItem[];
  transcriptId: string | null;
  generatedAt: string;
};

@Injectable()
export class AiPersonalizedMeetingSummaryDataBuilderService {
  constructor(
    private readonly meetingParticipantsRepository: MeetingParticipantsRepository,
    private readonly meetingTranscriptsService: MeetingTranscriptsService,
    private readonly projectAccessService: ProjectAccessService,
    private readonly usersService: UsersService,
  ) {}

  async buildPersonalizedMeetingSummaryInput(params: {
    workspaceId: string;
    projectId: string;
    meeting: Meeting;
    sourceSummary: MeetingSummaryDocument;
    targetUserId: string;
  }): Promise<PersonalizedMeetingSummaryInputData> {
    const [project, participants, targetUser, transcript] = await Promise.all([
      this.projectAccessService.assertProjectInWorkspace(
        params.projectId,
        params.workspaceId,
      ),
      this.meetingParticipantsRepository.findByMeeting(params.meeting.id),
      this.usersService.findById(params.targetUserId),
      this.findTranscriptIfAvailable(params.meeting),
    ]);

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const targetActionItems = this.findTargetActionItems(
      params.sourceSummary.actionItems ?? [],
      {
        userId: targetUser.id,
        fullName: targetUser.fullName,
        email: targetUser.email,
      },
    );

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
      sprint: params.meeting.sprint
        ? {
            id: params.meeting.sprint.id,
            name: params.meeting.sprint.name,
            status: params.meeting.sprint.status,
            startDate: params.meeting.sprint.startDate,
            endDate: params.meeting.sprint.endDate,
          }
        : null,
      meeting: {
        id: params.meeting.id,
        title: params.meeting.title,
        description: params.meeting.description,
        meetingType: params.meeting.meetingType,
        meetingDate: params.meeting.meetingDate,
        status: params.meeting.status,
      },
      targetUser: {
        userId: targetUser.id,
        fullName: targetUser.fullName,
        email: targetUser.email,
      },
      participants: participants.map((participant) => ({
        userId: participant.userId,
        fullName: participant.user?.fullName ?? null,
        email: participant.user?.email ?? null,
        role: participant.role,
        attended: participant.attended,
      })),
      meetingSummary: {
        id: params.sourceSummary._id.toString(),
        title: params.sourceSummary.title,
        summary: params.sourceSummary.summary,
        keyPoints: params.sourceSummary.keyPoints ?? [],
        decisions: params.sourceSummary.decisions ?? [],
        actionItems: params.sourceSummary.actionItems ?? [],
        risks: params.sourceSummary.risks ?? [],
        openQuestions: params.sourceSummary.openQuestions ?? [],
        nextSteps: params.sourceSummary.nextSteps ?? [],
      },
      relatedTranscriptSnippets: transcript
        ? this.findRelatedTranscriptSnippets(transcript, {
            fullName: targetUser.fullName,
            email: targetUser.email,
            userId: targetUser.id,
          })
        : [],
      targetActionItems,
      transcriptId:
        transcript?._id.toString() ?? params.sourceSummary.transcriptId,
      generatedAt: new Date().toISOString(),
    };
  }

  private async findTranscriptIfAvailable(meeting: Meeting) {
    try {
      return await this.meetingTranscriptsService.findTranscriptForMeeting(
        meeting,
      );
    } catch {
      return null;
    }
  }

  private findTargetActionItems(
    actionItems: MeetingSummaryActionItem[],
    targetUser: { userId: string; fullName: string; email: string },
  ) {
    return actionItems.filter((item) => {
      if (item.assigneeUserId && item.assigneeUserId === targetUser.userId) {
        return true;
      }

      const haystack = [item.assigneeName, item.text, item.source]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        Boolean(targetUser.fullName) &&
        haystack.includes(targetUser.fullName.toLowerCase())
      );
    });
  }

  private findRelatedTranscriptSnippets(
    transcript: {
      rawTranscript: string;
      speakers?: { userId?: string; speakerName?: string; text: string }[];
    },
    targetUser: { userId: string; fullName: string; email: string },
  ) {
    const snippets = new Set<string>();
    const targetName = targetUser.fullName.toLowerCase();

    for (const speaker of transcript.speakers ?? []) {
      const speakerName = speaker.speakerName?.toLowerCase() ?? '';
      const text = speaker.text.trim();

      if (
        speaker.userId === targetUser.userId ||
        speakerName.includes(targetName) ||
        text.toLowerCase().includes(targetName)
      ) {
        snippets.add(
          [speaker.speakerName, speaker.text].filter(Boolean).join(': '),
        );
      }
    }

    for (const line of transcript.rawTranscript.split(/\r?\n/)) {
      const trimmedLine = line.trim();
      const normalizedLine = trimmedLine.toLowerCase();

      if (
        trimmedLine &&
        (normalizedLine.includes(targetName) ||
          normalizedLine.includes(targetUser.email.toLowerCase()))
      ) {
        snippets.add(trimmedLine);
      }
    }

    return [...snippets].slice(0, 20);
  }
}
