import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

@Schema({ timestamps: true, collection: 'ai_reports' })
export class AiReport {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ type: String })
  sprintId?: string | null;

  @Prop({ type: String })
  userId?: string | null;

  @Prop({
    type: String,
    required: true,
    enum: AiReportType,
    default: AiReportType.PersonalDailyReport,
  })
  reportType: AiReportType;

  @Prop({ required: true })
  reportDate: string;

  @Prop({ type: Object, default: {} })
  inputData: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  aiOutput: PersonalDailyReportOutput | TeamDailyReportOutput;

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

export const AiReportSchema = SchemaFactory.createForClass(AiReport);
