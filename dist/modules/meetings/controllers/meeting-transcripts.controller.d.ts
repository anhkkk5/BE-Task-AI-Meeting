import type { AuthUser } from '../../auth/types/auth-user.type';
import { AppendLiveTranscriptSegmentDto } from '../dto/append-live-transcript-segment.dto';
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
                liveSegments: import("../schemas/meeting-transcript.schema").MeetingTranscriptSegment[];
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    appendLiveSegment(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, dto: AppendLiveTranscriptSegmentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            segment: import("../schemas/meeting-transcript.schema").MeetingTranscriptSegment;
            transcript: {
                id: string;
                meetingId: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                rawTranscript: string;
                speakers: import("../schemas/meeting-transcript.schema").MeetingTranscriptSpeaker[];
                liveSegments: import("../schemas/meeting-transcript.schema").MeetingTranscriptSegment[];
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
                liveSegments: import("../schemas/meeting-transcript.schema").MeetingTranscriptSegment[];
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
}
