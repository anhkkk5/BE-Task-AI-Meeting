import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AiReportReviewStatus } from '../../../common/enums/ai-report-review-status.enum';
import { AiReportStatus } from '../../../common/enums/ai-report-status.enum';
import { AiReportType } from '../../../common/enums/ai-report-type.enum';

export type AiReportDocument = HydratedDocument<AiReport>;

/**
 * So lieu dinh luong cua bao cao giao ban.
 *
 * Duoc tinh o backend va luu lai thay vi tinh o frontend, vi frontend chi
 * nhan inputData o API detail. Neu tinh o frontend thi danh sach bao cao se
 * khong ve duoc the so lieu.
 */
export type TeamReportMetrics = {
  doneTasks: number;
  totalTasks: number;
  inProgressTasks: number;
  blockerCount: number;
  progressPercent: number;
  memberCount: number;
};

/** Nguon du lieu nguoi dung cho phep AI su dung khi tao bao cao. */
export type TeamReportDataSources = {
  tasks: boolean;
  dailyUpdates: boolean;
  meetingTranscripts: boolean;
  previousReport: boolean;
};

export type PersonalDailyReportOutput = {
  title: string;
  summary: string;
  yesterdaySummary?: string;
  todayPlanSummary?: string;
  completedTasks?: string[];
  inProgressTasks?: string[];
  blockers?: string[];
  risks?: string[];
  /** Tom tat cong viec da ban giao / nhan ban giao trong ngay. */
  handoverSummary?: string;
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
  /** Tom tat ban giao cong viec cua ca doi trong ngay. */
  handoverSummary?: string;
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

  /**
   * Trang thai duyet cua con nguoi, tach khoi `status`.
   *
   * `status` noi ve ket qua goi AI, con truong nay noi ve quy trinh: AI sinh
   * ban nhap, nguoi quan ly xem roi moi duyet thanh bao cao chinh thuc.
   */
  @Prop({
    type: String,
    required: true,
    enum: AiReportReviewStatus,
    default: AiReportReviewStatus.Draft,
  })
  reviewStatus: AiReportReviewStatus;

  @Prop({ type: Object })
  metrics?: TeamReportMetrics;

  @Prop({ type: Object })
  dataSources?: TeamReportDataSources;

  @Prop({ type: String })
  extraInstruction?: string | null;

  @Prop({ type: String })
  editedBy?: string | null;

  @Prop({ type: Date })
  editedAt?: Date | null;

  @Prop({ type: String })
  approvedBy?: string | null;

  @Prop({ type: Date })
  approvedAt?: Date | null;

  @Prop({ required: true })
  createdBy: string;
}

export const AiReportSchema = SchemaFactory.createForClass(AiReport);
