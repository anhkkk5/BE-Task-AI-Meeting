import type { AuthUser } from '../../auth/types/auth-user.type';
import { MeetingImportService } from '../services/meeting-import.service';
export declare class MeetingImportController {
    private readonly service;
    constructor(service: MeetingImportService);
    create(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, file: Express.Multer.File): Promise<{
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
                status: import("../schemas/meeting-import-job.schema").MeetingImportJobStatus;
                progress: number;
                message?: string | null;
                error?: string | null;
                transcriptId?: string | null;
                summaryId?: string | null;
            };
        };
    }>;
    latest(user: AuthUser, workspaceId: string, projectId: string, meetingId: string): Promise<{
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
                status: import("../schemas/meeting-import-job.schema").MeetingImportJobStatus;
                progress: number;
                message?: string | null;
                error?: string | null;
                transcriptId?: string | null;
                summaryId?: string | null;
            } | null;
        };
    }>;
    get(user: AuthUser, workspaceId: string, projectId: string, meetingId: string, jobId: string): Promise<{
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
                status: import("../schemas/meeting-import-job.schema").MeetingImportJobStatus;
                progress: number;
                message?: string | null;
                error?: string | null;
                transcriptId?: string | null;
                summaryId?: string | null;
            };
        };
    }>;
}
