import { HydratedDocument } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
export type MeetingSummaryDocument = HydratedDocument<MeetingSummary>;
export type MeetingSummaryActionItem = {
    text: string;
    assigneeName?: string | null;
    assigneeUserId?: string | null;
    dueDate?: string | null;
    status?: string | null;
    source?: string | null;
};
export type MeetingSummaryOutput = {
    title: string;
    summary: string;
    keyPoints: string[];
    decisions: string[];
    actionItems: MeetingSummaryActionItem[];
    risks: string[];
    openQuestions: string[];
    nextSteps: string[];
    generatedText: string;
};
export declare class MeetingSummaryActionItemSchemaClass {
    text: string;
    assigneeName?: string | null;
    assigneeUserId?: string | null;
    dueDate?: string | null;
    status?: string | null;
    source?: string | null;
}
export declare const MeetingSummaryActionItemSchema: import("mongoose").Schema<MeetingSummaryActionItemSchemaClass, import("mongoose").Model<MeetingSummaryActionItemSchemaClass, any, any, any, any, any, MeetingSummaryActionItemSchemaClass>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MeetingSummaryActionItemSchemaClass, import("mongoose").Document<unknown, {}, MeetingSummaryActionItemSchemaClass, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummaryActionItemSchemaClass & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    text?: import("mongoose").SchemaDefinitionProperty<string, MeetingSummaryActionItemSchemaClass, import("mongoose").Document<unknown, {}, MeetingSummaryActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummaryActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    assigneeName?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingSummaryActionItemSchemaClass, import("mongoose").Document<unknown, {}, MeetingSummaryActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummaryActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    assigneeUserId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingSummaryActionItemSchemaClass, import("mongoose").Document<unknown, {}, MeetingSummaryActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummaryActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dueDate?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingSummaryActionItemSchemaClass, import("mongoose").Document<unknown, {}, MeetingSummaryActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummaryActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingSummaryActionItemSchemaClass, import("mongoose").Document<unknown, {}, MeetingSummaryActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummaryActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingSummaryActionItemSchemaClass, import("mongoose").Document<unknown, {}, MeetingSummaryActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummaryActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MeetingSummaryActionItemSchemaClass>;
export declare class MeetingSummary {
    workspaceId: string;
    projectId: string;
    sprintId?: string | null;
    meetingId: string;
    transcriptId: string;
    title: string;
    summary: string;
    keyPoints: string[];
    decisions: string[];
    actionItems: MeetingSummaryActionItem[];
    risks: string[];
    openQuestions: string[];
    nextSteps: string[];
    aiOutput: MeetingSummaryOutput;
    aiModel?: string;
    status: AiReportStatus;
    createdBy: string;
}
export declare const MeetingSummarySchema: import("mongoose").Schema<MeetingSummary, import("mongoose").Model<MeetingSummary, any, any, any, any, any, MeetingSummary>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    workspaceId?: import("mongoose").SchemaDefinitionProperty<string, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<string, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sprintId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    meetingId?: import("mongoose").SchemaDefinitionProperty<string, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    transcriptId?: import("mongoose").SchemaDefinitionProperty<string, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    summary?: import("mongoose").SchemaDefinitionProperty<string, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    keyPoints?: import("mongoose").SchemaDefinitionProperty<string[], MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    decisions?: import("mongoose").SchemaDefinitionProperty<string[], MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    actionItems?: import("mongoose").SchemaDefinitionProperty<MeetingSummaryActionItem[], MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    risks?: import("mongoose").SchemaDefinitionProperty<string[], MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    openQuestions?: import("mongoose").SchemaDefinitionProperty<string[], MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    nextSteps?: import("mongoose").SchemaDefinitionProperty<string[], MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    aiOutput?: import("mongoose").SchemaDefinitionProperty<MeetingSummaryOutput, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    aiModel?: import("mongoose").SchemaDefinitionProperty<string | undefined, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<AiReportStatus, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<string, MeetingSummary, import("mongoose").Document<unknown, {}, MeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MeetingSummary>;
