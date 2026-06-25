import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';

export type AiPromptLogDocument = HydratedDocument<AiPromptLog>;

@Schema({ timestamps: true, collection: 'ai_prompt_logs' })
export class AiPromptLog {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ type: String })
  userId?: string | null;

  @Prop({
    type: String,
    required: true,
    enum: AiReportType,
    default: AiReportType.PersonalDailyReport,
  })
  feature: AiReportType;

  @Prop({ name: 'model', type: String })
  aiModel?: string;

  @Prop({ type: String })
  prompt?: string;

  @Prop({ type: String })
  response?: string;

  @Prop({ type: Number })
  responseTimeMs?: number;

  @Prop({ default: true })
  success: boolean;

  @Prop({ type: String })
  errorMessage?: string | null;
}

export const AiPromptLogSchema = SchemaFactory.createForClass(AiPromptLog);
