import { Model } from 'mongoose';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { SaveMeetingTranscriptDto } from '../dto/save-meeting-transcript.dto';
import { MeetingTranscriptDocument } from '../schemas/meeting-transcript.schema';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingAccessService } from './meeting-access.service';
export declare class MeetingTranscriptsService {
    private readonly transcriptModel;
    private readonly meetingsRepository;
    private readonly meetingAccessService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    constructor(transcriptModel: Model<MeetingTranscriptDocument> | null, meetingsRepository: MeetingsRepository, meetingAccessService: MeetingAccessService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService);
    saveTranscript(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, dto: SaveMeetingTranscriptDto): Promise<{
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
    getTranscript(currentUserId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
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
    private getTranscriptModel;
    private getTranscriptId;
    private toTranscriptResponse;
}
