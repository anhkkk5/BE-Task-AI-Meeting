import type { AuthUser } from '../../auth/types/auth-user.type';
import { MeetingImportService } from '../services/meeting-import.service';
export declare class MeetingImportController {
    private readonly service;
    constructor(service: MeetingImportService);
    create(user: AuthUser, workspaceId: string, projectId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                fileName: string;
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId?: string | null;
                createdBy: string;
                mimeType: string;
                fileSize: number;
                kind: "DOCUMENT" | "MEDIA";
                status: import("../schemas/meeting-import-job.schema").MeetingImportJobStatus;
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
    latest(user: AuthUser, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                fileName: string;
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId?: string | null;
                createdBy: string;
                mimeType: string;
                fileSize: number;
                kind: "DOCUMENT" | "MEDIA";
                status: import("../schemas/meeting-import-job.schema").MeetingImportJobStatus;
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
    list(user: AuthUser, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                fileName: string;
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId?: string | null;
                createdBy: string;
                mimeType: string;
                fileSize: number;
                kind: "DOCUMENT" | "MEDIA";
                status: import("../schemas/meeting-import-job.schema").MeetingImportJobStatus;
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
    get(user: AuthUser, workspaceId: string, projectId: string, jobId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            job: {
                fileName: string;
                id: string;
                _id: undefined;
                __v: undefined;
                workspaceId: string;
                projectId: string;
                meetingId?: string | null;
                createdBy: string;
                mimeType: string;
                fileSize: number;
                kind: "DOCUMENT" | "MEDIA";
                status: import("../schemas/meeting-import-job.schema").MeetingImportJobStatus;
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
}
