import { Model } from 'mongoose';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { SaveMeetingTranscriptDto } from '../dto/save-meeting-transcript.dto';
import { AppendLiveTranscriptSegmentDto } from '../dto/append-live-transcript-segment.dto';
import { MeetingTranscript, MeetingTranscriptDocument, MeetingTranscriptSegment } from '../schemas/meeting-transcript.schema';
import { MeetingsRepository } from '../repositories/meetings.repository';
import { MeetingParticipantsRepository } from '../repositories/meeting-participants.repository';
import { MeetingAccessService } from './meeting-access.service';
export declare class MeetingTranscriptsService {
    private readonly transcriptModel;
    private readonly meetingsRepository;
    private readonly meetingParticipantsRepository;
    private readonly meetingAccessService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    constructor(transcriptModel: Model<MeetingTranscriptDocument> | null, meetingsRepository: MeetingsRepository, meetingParticipantsRepository: MeetingParticipantsRepository, meetingAccessService: MeetingAccessService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService);
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
                liveSegments: MeetingTranscriptSegment[];
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
                liveSegments: MeetingTranscriptSegment[];
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    appendLiveSegment(currentUserId: string, workspaceId: string, projectId: string, meetingId: string, dto: AppendLiveTranscriptSegmentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            segment: MeetingTranscriptSegment;
            transcript: {
                id: string;
                meetingId: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                rawTranscript: string;
                speakers: import("../schemas/meeting-transcript.schema").MeetingTranscriptSpeaker[];
                liveSegments: MeetingTranscriptSegment[];
                createdBy: string;
                createdAt: Date | undefined;
                updatedAt: Date | undefined;
            };
        };
    }>;
    findTranscriptForMeeting(meeting: {
        mongoTranscriptId: string | null;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, MeetingTranscript, {}, import("mongoose").DefaultSchemaOptions> & MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, MeetingTranscript, {}, import("mongoose").DefaultSchemaOptions> & MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    private getTranscriptModel;
    private getTranscriptId;
    private toTranscriptResponse;
    private buildSpeakersFromSegments;
    private buildRawTranscript;
}
