import { Meeting } from '../../meetings/entities/meeting.entity';
import { MeetingParticipantsRepository } from '../../meetings/repositories/meeting-participants.repository';
import { MeetingTranscriptsService } from '../../meetings/services/meeting-transcripts.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { UsersService } from '../../users/services/users.service';
import { MeetingSummaryActionItem, MeetingSummaryDocument } from '../schemas/meeting-summary.schema';
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
export declare class AiPersonalizedMeetingSummaryDataBuilderService {
    private readonly meetingParticipantsRepository;
    private readonly meetingTranscriptsService;
    private readonly projectAccessService;
    private readonly usersService;
    constructor(meetingParticipantsRepository: MeetingParticipantsRepository, meetingTranscriptsService: MeetingTranscriptsService, projectAccessService: ProjectAccessService, usersService: UsersService);
    buildPersonalizedMeetingSummaryInput(params: {
        workspaceId: string;
        projectId: string;
        meeting: Meeting;
        sourceSummary: MeetingSummaryDocument;
        targetUserId: string;
    }): Promise<PersonalizedMeetingSummaryInputData>;
    private findTranscriptIfAvailable;
    private findTargetActionItems;
    private findRelatedTranscriptSnippets;
    private isUuidLike;
}
