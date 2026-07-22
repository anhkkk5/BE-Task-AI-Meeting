import { HydratedDocument } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
export type PersonalizedMeetingSummaryDocument = HydratedDocument<PersonalizedMeetingSummary>;
export type PersonalizedMeetingActionItem = {
    title: string;
    assigneeId?: string | null;
    assigneeName?: string | null;
    deadline?: string | null;
    source?: string | null;
};
export type PersonalizedMeetingSummaryOutput = {
    title: string;
    personalSummary: string;
    relevantDecisions: string[];
    myActionItems: PersonalizedMeetingActionItem[];
    mentions: string[];
    risks: string[];
    nextSteps: string[];
    generatedText: string;
};
export declare class PersonalizedMeetingActionItemSchemaClass {
    title: string;
    assigneeId?: string | null;
    assigneeName?: string | null;
    deadline?: string | null;
    source?: string | null;
}
export declare const PersonalizedMeetingActionItemSchema: import("mongoose").Schema<PersonalizedMeetingActionItemSchemaClass, import("mongoose").Model<PersonalizedMeetingActionItemSchemaClass, any, any, any, any, any, PersonalizedMeetingActionItemSchemaClass>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PersonalizedMeetingActionItemSchemaClass, import("mongoose").Document<unknown, {}, PersonalizedMeetingActionItemSchemaClass, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingActionItemSchemaClass & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, PersonalizedMeetingActionItemSchemaClass, import("mongoose").Document<unknown, {}, PersonalizedMeetingActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    assigneeId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, PersonalizedMeetingActionItemSchemaClass, import("mongoose").Document<unknown, {}, PersonalizedMeetingActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    assigneeName?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, PersonalizedMeetingActionItemSchemaClass, import("mongoose").Document<unknown, {}, PersonalizedMeetingActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    deadline?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, PersonalizedMeetingActionItemSchemaClass, import("mongoose").Document<unknown, {}, PersonalizedMeetingActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, PersonalizedMeetingActionItemSchemaClass, import("mongoose").Document<unknown, {}, PersonalizedMeetingActionItemSchemaClass, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingActionItemSchemaClass & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, PersonalizedMeetingActionItemSchemaClass>;
export declare class PersonalizedMeetingSummary {
    workspaceId: string;
    projectId: string;
    sprintId?: string | null;
    meetingId: string;
    userId: string;
    sourceSummaryId: string;
    transcriptId?: string | null;
    inputData: Record<string, unknown>;
    aiOutput: PersonalizedMeetingSummaryOutput;
    aiModel?: string;
    status: AiReportStatus;
    createdBy: string;
}
export declare const PersonalizedMeetingSummarySchema: import("mongoose").Schema<PersonalizedMeetingSummary, import("mongoose").Model<PersonalizedMeetingSummary, any, any, any, any, any, PersonalizedMeetingSummary>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    workspaceId?: import("mongoose").SchemaDefinitionProperty<string, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<string, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sprintId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    meetingId?: import("mongoose").SchemaDefinitionProperty<string, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sourceSummaryId?: import("mongoose").SchemaDefinitionProperty<string, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    transcriptId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    inputData?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown>, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    aiOutput?: import("mongoose").SchemaDefinitionProperty<PersonalizedMeetingSummaryOutput, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    aiModel?: import("mongoose").SchemaDefinitionProperty<string | undefined, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<AiReportStatus, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<string, PersonalizedMeetingSummary, import("mongoose").Document<unknown, {}, PersonalizedMeetingSummary, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PersonalizedMeetingSummary & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, PersonalizedMeetingSummary>;
