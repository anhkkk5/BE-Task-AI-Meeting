import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

@Schema({ _id: false })
export class MeetingSummaryActionItemSchemaClass {
  @Prop({ required: true })
  text: string;

  @Prop({ type: String })
  assigneeName?: string | null;

  @Prop({ type: String })
  assigneeUserId?: string | null;

  @Prop({ type: String })
  dueDate?: string | null;

  @Prop({ type: String })
  status?: string | null;

  @Prop({ type: String })
  source?: string | null;
}

export const MeetingSummaryActionItemSchema = SchemaFactory.createForClass(
  MeetingSummaryActionItemSchemaClass,
);

@Schema({ timestamps: true, collection: 'meeting_summaries' })
export class MeetingSummary {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ type: String })
  sprintId?: string | null;

  @Prop({ required: true })
  meetingId: string;

  @Prop({ required: true })
  transcriptId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ type: [String], default: [] })
  keyPoints: string[];

  @Prop({ type: [String], default: [] })
  decisions: string[];

  @Prop({ type: [MeetingSummaryActionItemSchema], default: [] })
  actionItems: MeetingSummaryActionItem[];

  @Prop({ type: [String], default: [] })
  risks: string[];

  @Prop({ type: [String], default: [] })
  openQuestions: string[];

  @Prop({ type: [String], default: [] })
  nextSteps: string[];

  @Prop({ type: Object, default: {} })
  aiOutput: MeetingSummaryOutput;

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

export const MeetingSummarySchema =
  SchemaFactory.createForClass(MeetingSummary);
