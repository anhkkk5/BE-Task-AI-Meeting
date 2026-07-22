import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';

export type PersonalizedMeetingSummaryDocument =
  HydratedDocument<PersonalizedMeetingSummary>;

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

@Schema({ _id: false })
export class PersonalizedMeetingActionItemSchemaClass {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String })
  assigneeId?: string | null;

  @Prop({ type: String })
  assigneeName?: string | null;

  @Prop({ type: String })
  deadline?: string | null;

  @Prop({ type: String })
  source?: string | null;
}

export const PersonalizedMeetingActionItemSchema = SchemaFactory.createForClass(
  PersonalizedMeetingActionItemSchemaClass,
);

@Schema({ timestamps: true, collection: 'personalized_meeting_summaries' })
export class PersonalizedMeetingSummary {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ type: String })
  sprintId?: string | null;

  @Prop({ required: true })
  meetingId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  sourceSummaryId: string;

  @Prop({ type: String })
  transcriptId?: string | null;

  @Prop({ type: Object, default: {} })
  inputData: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  aiOutput: PersonalizedMeetingSummaryOutput;

  @Prop({ name: 'model', type: String })
  aiModel?: string;

  @Prop({
    type: String,
    required: true,
    enum: AiReportStatus,
    default: AiReportStatus.Completed,
  })
  status: AiReportStatus;

  @Prop({ required: true })
  createdBy: string;
}

export const PersonalizedMeetingSummarySchema = SchemaFactory.createForClass(
  PersonalizedMeetingSummary,
);

PersonalizedMeetingSummarySchema.index({
  meetingId: 1,
  userId: 1,
  sourceSummaryId: 1,
});

PersonalizedMeetingSummarySchema.index({
  workspaceId: 1,
  projectId: 1,
  userId: 1,
});
