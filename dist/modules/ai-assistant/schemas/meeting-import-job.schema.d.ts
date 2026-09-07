import { HydratedDocument } from 'mongoose';
export type MeetingImportJobDocument = HydratedDocument<MeetingImportJob>;
export type MeetingImportJobStatus = 'QUEUED' | 'EXTRACTING' | 'TRANSCRIBING' | 'SUMMARIZING' | 'COMPLETED' | 'FAILED';
export declare class MeetingImportJob {
    workspaceId: string;
    projectId: string;
    meetingId?: string | null;
    createdBy: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    kind: 'DOCUMENT' | 'MEDIA';
    status: MeetingImportJobStatus;
    progress: number;
    message?: string | null;
    error?: string | null;
    transcriptId?: string | null;
    summaryId?: string | null;
    transcript?: string | null;
    summary?: Record<string, unknown> | null;
}
export declare const MeetingImportJobSchema: import("mongoose").Schema<MeetingImportJob, import("mongoose").Model<MeetingImportJob, any, any, any, any, any, MeetingImportJob>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    workspaceId?: import("mongoose").SchemaDefinitionProperty<string, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<string, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    meetingId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<string, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fileName?: import("mongoose").SchemaDefinitionProperty<string, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    mimeType?: import("mongoose").SchemaDefinitionProperty<string, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    fileSize?: import("mongoose").SchemaDefinitionProperty<number, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    kind?: import("mongoose").SchemaDefinitionProperty<"DOCUMENT" | "MEDIA", MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<MeetingImportJobStatus, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    progress?: import("mongoose").SchemaDefinitionProperty<number, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    error?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transcriptId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    summaryId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    transcript?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    summary?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown> | null | undefined, MeetingImportJob, import("mongoose").Document<unknown, {}, MeetingImportJob, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingImportJob & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, MeetingImportJob>;
