import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MeetingTranscriptDocument = HydratedDocument<MeetingTranscript>;

@Schema({ _id: false })
export class MeetingTranscriptSpeaker {
  @Prop({ type: String })
  userId?: string;

  @Prop({ type: String })
  speakerName?: string;

  @Prop({ required: true })
  text: string;
}

export const MeetingTranscriptSpeakerSchema = SchemaFactory.createForClass(
  MeetingTranscriptSpeaker,
);

@Schema({ _id: false })
export class MeetingTranscriptSegment {
  @Prop({ type: String })
  userId?: string;

  @Prop({ type: String })
  speakerName?: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ type: Date })
  endedAt?: Date | null;

  @Prop({ type: Number })
  confidence?: number | null;

  @Prop({ type: String, default: 'browser-speech' })
  source: string;
}

export const MeetingTranscriptSegmentSchema = SchemaFactory.createForClass(
  MeetingTranscriptSegment,
);

@Schema({ timestamps: true, collection: 'meeting_transcripts' })
export class MeetingTranscript {
  @Prop({ required: true })
  meetingId: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ type: String })
  sprintId?: string | null;

  @Prop({ required: true })
  rawTranscript: string;

  @Prop({ type: [MeetingTranscriptSpeakerSchema], default: [] })
  speakers: MeetingTranscriptSpeaker[];

  @Prop({ type: [MeetingTranscriptSegmentSchema], default: [] })
  liveSegments: MeetingTranscriptSegment[];

  @Prop({ required: true })
  createdBy: string;
}

export const MeetingTranscriptSchema =
  SchemaFactory.createForClass(MeetingTranscript);
