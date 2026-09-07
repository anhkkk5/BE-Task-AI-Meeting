import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MeetingImportJobDocument = HydratedDocument<MeetingImportJob>;
export type MeetingImportJobStatus =
  | 'QUEUED'
  | 'EXTRACTING'
  | 'TRANSCRIBING'
  | 'SUMMARIZING'
  | 'COMPLETED'
  | 'FAILED';

@Schema({ timestamps: true, collection: 'meeting_import_jobs' })
export class MeetingImportJob {
  @Prop({ required: true }) workspaceId: string;
  @Prop({ required: true }) projectId: string;
  @Prop({ type: String }) meetingId?: string | null;
  @Prop({ required: true }) createdBy: string;
  @Prop({ required: true }) fileName: string;
  @Prop({ required: true }) mimeType: string;
  @Prop({ required: true }) fileSize: number;
  @Prop({ required: true }) kind: 'DOCUMENT' | 'MEDIA';
  @Prop({ required: true, default: 'QUEUED' }) status: MeetingImportJobStatus;
  @Prop({ required: true, default: 5 }) progress: number;
  @Prop({ type: String }) message?: string | null;
  @Prop({ type: String }) error?: string | null;
  @Prop({ type: String }) transcriptId?: string | null;
  @Prop({ type: String }) summaryId?: string | null;
  @Prop({ type: String }) transcript?: string | null;
  @Prop({ type: Object }) summary?: Record<string, unknown> | null;
}

export const MeetingImportJobSchema = SchemaFactory.createForClass(MeetingImportJob);
MeetingImportJobSchema.index({ meetingId: 1, createdAt: -1 });
MeetingImportJobSchema.index({ projectId: 1, createdAt: -1 });
