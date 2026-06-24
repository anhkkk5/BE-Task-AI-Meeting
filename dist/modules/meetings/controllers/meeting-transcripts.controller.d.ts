import type { AuthUser } from '../../auth/types/auth-user.type';
import { SaveMeetingTranscriptDto } from '../dto/save-meeting-transcript.dto';
import { MeetingTranscriptsService } from '../services/meeting-transcripts.service';
export declare class MeetingTranscriptsController {
    private readonly meetingTranscriptsService;
    constructor(meetingTranscriptsService: MeetingTranscriptsService);
    saveTranscript(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, dto: SaveMeetingTranscriptDto): Promise<{
        success: boolean;
        message: string;
        data: {
            transcript: {
                id: string;
                meetingId: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                rawTranscript: string;
                speakers: import("../schemas/meeting-transcript.schema").MeetingTranscriptSpeaker[];
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    getTranscript(user: AuthUser, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            transcript: {
                id: string;
                meetingId: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                rawTranscript: string;
                speakers: import("../schemas/meeting-transcript.schema").MeetingTranscriptSpeaker[];
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
}
