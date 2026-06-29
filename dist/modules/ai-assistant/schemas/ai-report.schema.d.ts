import { HydratedDocument } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';
export type AiReportDocument = HydratedDocument<AiReport>;
export type PersonalDailyReportOutput = {
    title: string;
    summary: string;
    yesterdaySummary?: string;
    todayPlanSummary?: string;
    completedTasks?: string[];
    inProgressTasks?: string[];
    blockers?: string[];
    risks?: string[];
    recommendations?: string[];
    generatedText: string;
};
export type TeamDailyReportOutput = {
    title: string;
    summary: string;
    teamProgress: string;
    completedWork?: string[];
    todayFocus?: string[];
    blockers?: string[];
    risks?: string[];
    missingDailyUpdates?: string[];
    memberSummaries?: {
        userId: string;
        fullName: string;
        summary: string;
        blockers: string[];
    }[];
    recommendations?: string[];
    generatedText: string;
};
export declare class AiReport {
    workspaceId: string;
    projectId: string;
    sprintId?: string | null;
    userId?: string | null;
    reportType: AiReportType;
    reportDate: string;
    inputData: Record<string, unknown>;
    aiOutput: PersonalDailyReportOutput | TeamDailyReportOutput;
    aiModel?: string;
    status: AiReportStatus;
    createdBy: string;
}
export declare const AiReportSchema: import("mongoose").Schema<AiReport, import("mongoose").Model<AiReport, any, any, any, any, any, AiReport>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    workspaceId?: import("mongoose").SchemaDefinitionProperty<string, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<string, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sprintId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string | null | undefined, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reportType?: import("mongoose").SchemaDefinitionProperty<AiReportType, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    reportDate?: import("mongoose").SchemaDefinitionProperty<string, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    inputData?: import("mongoose").SchemaDefinitionProperty<Record<string, unknown>, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    aiOutput?: import("mongoose").SchemaDefinitionProperty<PersonalDailyReportOutput | TeamDailyReportOutput, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    aiModel?: import("mongoose").SchemaDefinitionProperty<string | undefined, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<AiReportStatus, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdBy?: import("mongoose").SchemaDefinitionProperty<string, AiReport, import("mongoose").Document<unknown, {}, AiReport, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<AiReport & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, AiReport>;
