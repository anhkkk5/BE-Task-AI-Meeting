import { HydratedDocument } from 'mongoose';
export type MeetingTranscriptDocument = HydratedDocument<MeetingTranscript>;
export declare class MeetingTranscriptSpeaker {
    userId?: string;
    speakerName?: string;
    text: string;
}
export declare const MeetingTranscriptSpeakerSchema: import("mongoose").Schema<MeetingTranscriptSpeaker, import("mongoose").Model<MeetingTranscriptSpeaker, any, any, any, any, any, MeetingTranscriptSpeaker>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MeetingTranscriptSpeaker, import("mongoose").Document<unknown, {}, MeetingTranscriptSpeaker, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSpeaker & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<string | undefined, MeetingTranscriptSpeaker, import("mongoose").Document<unknown, {}, MeetingTranscriptSpeaker, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSpeaker & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    speakerName?: import("mongoose").SchemaDefinitionProperty<string | undefined, MeetingTranscriptSpeaker, import("mongoose").Document<unknown, {}, MeetingTranscriptSpeaker, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSpeaker & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    text?: import("mongoose").SchemaDefinitionProperty<string, MeetingTranscriptSpeaker, import("mongoose").Document<unknown, {}, MeetingTranscriptSpeaker, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSpeaker & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MeetingTranscriptSpeaker>;
export declare class MeetingTranscript {
    meetingId: string;
    workspaceId: string;
    projectId: string;
    sprintId?: string | null;
    rawTranscript: string;
    speakers: MeetingTranscriptSpeaker[];
    createdBy: string;
}
export declare const MeetingTranscriptSchema: import("mongoose").Schema<MeetingTranscript, import("mongoose").Model<MeetingTranscript, any, any, any, any, any, MeetingTranscript>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscript & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    meetingId?: import("mongoose").SchemaDefinitionProperty<string, MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    workspaceId?: import("mongoose").SchemaDefinitionProperty<string, MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<string, MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sprintId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rawTranscript?: import("mongoose").SchemaDefinitionProperty<string, MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    speakers?: import("mongoose").SchemaDefinitionProperty<MeetingTranscriptSpeaker[], MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<string, MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscript & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MeetingTranscript>;
