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
export declare class MeetingTranscriptSegment {
    userId?: string;
    speakerName?: string;
    text: string;
    startedAt: Date;
    endedAt?: Date | null;
    confidence?: number | null;
    source: string;
}
export declare const MeetingTranscriptSegmentSchema: import("mongoose").Schema<MeetingTranscriptSegment, import("mongoose").Model<MeetingTranscriptSegment, any, any, any, any, any, MeetingTranscriptSegment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MeetingTranscriptSegment, import("mongoose").Document<unknown, {}, MeetingTranscriptSegment, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSegment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<string | undefined, MeetingTranscriptSegment, import("mongoose").Document<unknown, {}, MeetingTranscriptSegment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSegment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    speakerName?: import("mongoose").SchemaDefinitionProperty<string | undefined, MeetingTranscriptSegment, import("mongoose").Document<unknown, {}, MeetingTranscriptSegment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSegment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    text?: import("mongoose").SchemaDefinitionProperty<string, MeetingTranscriptSegment, import("mongoose").Document<unknown, {}, MeetingTranscriptSegment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSegment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    startedAt?: import("mongoose").SchemaDefinitionProperty<Date, MeetingTranscriptSegment, import("mongoose").Document<unknown, {}, MeetingTranscriptSegment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSegment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    endedAt?: import("mongoose").SchemaDefinitionProperty<Date | null | undefined, MeetingTranscriptSegment, import("mongoose").Document<unknown, {}, MeetingTranscriptSegment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSegment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    confidence?: import("mongoose").SchemaDefinitionProperty<number | null | undefined, MeetingTranscriptSegment, import("mongoose").Document<unknown, {}, MeetingTranscriptSegment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSegment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<string, MeetingTranscriptSegment, import("mongoose").Document<unknown, {}, MeetingTranscriptSegment, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingTranscriptSegment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MeetingTranscriptSegment>;
export declare class MeetingTranscript {
    meetingId: string;
    workspaceId: string;
    projectId: string;
    sprintId?: string | null;
    rawTranscript: string;
    speakers: MeetingTranscriptSpeaker[];
    liveSegments: MeetingTranscriptSegment[];
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
    liveSegments?: import("mongoose").SchemaDefinitionProperty<MeetingTranscriptSegment[], MeetingTranscript, import("mongoose").Document<unknown, {}, MeetingTranscript, {
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
