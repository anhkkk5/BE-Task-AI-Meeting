import { HydratedDocument } from 'mongoose';
export type ProjectAssistantMessageDocument = HydratedDocument<ProjectAssistantMessage>;
export declare class ProjectAssistantMessage {
    workspaceId: string;
    projectId: string;
    userId: string;
    sprintId?: string | null;
    role: 'USER' | 'ASSISTANT';
    content: string;
    sources: Record<string, unknown>[];
    actionDraft?: Record<string, unknown> | null;
}
export declare const ProjectAssistantMessageSchema: import("mongoose").Schema<ProjectAssistantMessage, import("mongoose").Model<ProjectAssistantMessage, any, any, any, any, any, ProjectAssistantMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    workspaceId?: import("mongoose").SchemaDefinitionProperty<string, ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<string, ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sprintId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    role?: import("mongoose").SchemaDefinitionProperty<"USER" | "ASSISTANT", ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sources?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown>[], ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    actionDraft?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown> | null | undefined, ProjectAssistantMessage, import("mongoose").Document<unknown, {}, ProjectAssistantMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectAssistantMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ProjectAssistantMessage>;
