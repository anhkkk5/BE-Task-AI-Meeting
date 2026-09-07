import { Model } from 'mongoose';
import { MeetingTranscriptsService } from '../../meetings/services/meeting-transcripts.service';
import { GroqTranscriptionService } from '../../meetings/services/groq-transcription.service';
import { AiMeetingSummaryService } from './ai-meeting-summary.service';
import { MeetingImportJobDocument, MeetingImportJobStatus } from '../schemas/meeting-import-job.schema';
type UploadedMeetingFile = Express.Multer.File;
export declare class MeetingImportService {
    private readonly jobModel;
    private readonly transcriptsService;
    private readonly transcriptionService;
    private readonly summaryService;
    private readonly logger;
    constructor(jobModel: Model<MeetingImportJobDocument> | null, transcriptsService: MeetingTranscriptsService, transcriptionService: GroqTranscriptionService, summaryService: AiMeetingSummaryService);
    createJob(userId: string, workspaceId: string, projectId: string, meetingId: string, file?: UploadedMeetingFile): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId: string;
                createdBy: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                kind: "DOCUMENT" | "MEDIA";
                status: MeetingImportJobStatus;
                progress: number;
                message?: string | null;
                error?: string | null;
                transcriptId?: string | null;
                summaryId?: string | null;
            };
        };
    }>;
    getJob(userId: string, workspaceId: string, projectId: string, meetingId: string, jobId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId: string;
                createdBy: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                kind: "DOCUMENT" | "MEDIA";
                status: MeetingImportJobStatus;
                progress: number;
                message?: string | null;
                error?: string | null;
                transcriptId?: string | null;
                summaryId?: string | null;
            };
        };
    }>;
    getLatestJob(userId: string, workspaceId: string, projectId: string, meetingId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId: string;
                createdBy: string;
                fileName: string;
                mimeType: string;
                fileSize: number;
                kind: "DOCUMENT" | "MEDIA";
                status: MeetingImportJobStatus;
                progress: number;
                message?: string | null;
                error?: string | null;
                transcriptId?: string | null;
                summaryId?: string | null;
            } | null;
        };
    }>;
    private process;
    private extractDocument;
    private transcribeMedia;
    private splitMedia;
    private validateFile;
    private fileKind;
    private normalizeFileName;
    private update;
    private getModel;
    private toResponse;
}
export {};
