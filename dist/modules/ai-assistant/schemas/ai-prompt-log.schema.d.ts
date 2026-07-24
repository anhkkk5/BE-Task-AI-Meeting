import { HydratedDocument } from 'mongoose';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
export type AiPromptLogDocument = HydratedDocument<AiPromptLog>;
export declare class AiPromptLog {
    workspaceId: string;
    projectId: string;
    userId?: string | null;
    feature: AiReportType;
    aiModel?: string;
    prompt?: string;
    response?: string;
    responseTimeMs?: number;
    success: boolean;
    errorMessage?: string | null;
}
export declare const AiPromptLogSchema: import("mongoose").Schema<AiPromptLog, import("mongoose").Model<AiPromptLog, any, any, any, any, any, AiPromptLog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    workspaceId?: import("mongoose").SchemaDefinitionProperty<string, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<string, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    feature?: import("mongoose").SchemaDefinitionProperty<AiReportType, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    aiModel?: import("mongoose").SchemaDefinitionProperty<string | undefined, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    prompt?: import("mongoose").SchemaDefinitionProperty<string | undefined, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    response?: import("mongoose").SchemaDefinitionProperty<string | undefined, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    responseTimeMs?: import("mongoose").SchemaDefinitionProperty<number | undefined, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    success?: import("mongoose").SchemaDefinitionProperty<boolean, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    errorMessage?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, AiPromptLog, import("mongoose").Document<unknown, {}, AiPromptLog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiPromptLog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, AiPromptLog>;
