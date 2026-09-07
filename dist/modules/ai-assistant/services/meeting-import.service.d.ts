import { Model } from 'mongoose';
import { GroqTranscriptionService } from '../../meetings/services/groq-transcription.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { AiProviderService } from './ai-provider.service';
import { MeetingImportJobDocument, MeetingImportJobStatus } from '../schemas/meeting-import-job.schema';
type UploadedMeetingFile = Express.Multer.File;
export declare class MeetingImportService {
    private readonly jobModel;
    private readonly transcriptionService;
    private readonly projectAccessService;
    private readonly aiProviderService;
    private readonly logger;
    constructor(jobModel: Model<MeetingImportJobDocument> | null, transcriptionService: GroqTranscriptionService, projectAccessService: ProjectAccessService, aiProviderService: AiProviderService);
    createJob(userId: string, workspaceId: string, projectId: string, file?: UploadedMeetingFile): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId?: string | null;
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
                transcript?: string | null;
                summary?: Record<string, unknown> | null;
            };
        };
    }>;
    getJob(userId: string, workspaceId: string, projectId: string, jobId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId?: string | null;
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
                transcript?: string | null;
                summary?: Record<string, unknown> | null;
            };
        };
    }>;
    getLatestJob(userId: string, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId?: string | null;
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
                transcript?: string | null;
                summary?: Record<string, unknown> | null;
            } | null;
        };
    }>;
    listJobs(userId: string, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId?: string | null;
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
                transcript?: string | null;
                summary?: Record<string, unknown> | null;
            }[];
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
