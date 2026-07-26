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
export declare class AiMeetingSummaryDataBuilderService {
    private readonly meetingParticipantsRepository;
    private readonly meetingTranscriptsService;
    private readonly projectAccessService;
    constructor(meetingParticipantsRepository: MeetingParticipantsRepository, meetingTranscriptsService: MeetingTranscriptsService, projectAccessService: ProjectAccessService);
    buildMeetingSummaryInput(params: {
        workspaceId: string;
        projectId: string;
        meeting: Meeting;
    }): Promise<MeetingSummaryInputData>;
    private resolveSpeakerName;
    private isUuidLike;
    private cleanRawTranscript;
    private normalizeTranscript;
}
