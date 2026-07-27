import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Optional } from '@nestjs/common';
import { Model } from 'mongoose';
import { mailConfig } from '../../../config/mail.config';
import { MailService } from '../../mail/services/mail.service';
import { buildTeamReportApprovedMail } from '../../mail/templates/mail-templates';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { AiReportEvent } from '../events/ai-report.event';
import {
  AiReport,
  AiReportDocument,
  TeamDailyReportOutput,
} from '../schemas/ai-report.schema';
import { AiReportEventsService } from '../services/ai-report-events.service';

/**
 * Gui email cho ca nhom khi bao cao giao ban duoc duyet.
 *
 * Chi gui o moc duyet, khong gui khi AI vua sinh ban nhap: ban nhap co the con
 * sai va se duoc nguoi quan ly sua, gui som se lam nhom doc nham thong tin.
 *
 * Mail di qua sendMailSafely vi thong bao chi la phu tro, SMTP loi khong duoc
 * lam that bai viec duyet bao cao.
 */
@Injectable()
export class TeamReportNotificationListener implements OnModuleInit {
  private readonly logger = new Logger(TeamReportNotificationListener.name);

  constructor(
    private readonly aiReportEvents: AiReportEventsService,
    private readonly mailService: MailService,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly projectsRepository: ProjectsRepository,
    @Optional()
    @InjectModel(AiReport.name)
    private readonly aiReportModel: Model<AiReportDocument> | null,
  ) {}

  onModuleInit() {
    this.aiReportEvents.onAiReportEvent((event) => this.handleEvent(event));
  }

  private async handleEvent(event: AiReportEvent) {
    if (event.type !== 'team_report_approved') return;

    const [members, project, report] = await Promise.all([
      this.workspaceMembersRepository.findActiveByWorkspace(event.workspaceId),
      this.projectsRepository.findByIdAndWorkspace(
        event.projectId,
        event.workspaceId,
      ),
      this.aiReportModel?.findById(event.reportId).exec() ?? null,
    ]);
    const recipients = members
      .map((member) => ({
        email: member.user?.email?.trim(),
        fullName: member.user?.fullName?.trim(),
      }))
      .filter((member) => Boolean(member.email));

    if (!recipients.length) {
      this.logger.warn(
        `Khong co thanh vien nao co email trong workspace ${event.workspaceId}, bo qua gui mail bao cao ${event.reportId}.`,
      );
      return;
    }

    const output = (report?.aiOutput ?? {}) as TeamDailyReportOutput;
    const approver = members.find(
      (member) => member.userId === event.approvedBy,
    );
    const metrics = report?.metrics;
    const reportUrl = this.reportUrl(event);

    // Gui tuan tu de khong bat SMTP nhan hang chuc ket noi cung luc.
    for (const recipient of recipients) {
      const mail = buildTeamReportApprovedMail({
        recipientName: recipient.fullName || 'bạn',
        approverName: approver?.user?.fullName ?? 'Người quản lý',
        projectName: project?.name ?? 'Dự án',
        reportDate: event.reportDate,
        reportTitle: event.title ?? 'Báo cáo giao ban',
        summary: event.summary ?? output.summary ?? '(chưa có tóm tắt)',
        progressLabel: metrics
          ? `${metrics.doneTasks}/${metrics.totalTasks} công việc hoàn thành (${metrics.progressPercent}%)`
          : null,
        todayFocus: output.todayFocus ?? [],
        blockers: output.blockers ?? [],
        reportUrl,
      });

      await this.mailService.sendMailSafely({
        to: recipient.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    }
  }

  /**
   * Link xem bao cao day du gui kem trong mail.
   *
   * Mail nay di den moi thanh vien workspace, nen endpoint dang sau link phai mo
   * cho ca thanh vien thuong doc. Neu sau nay thu hep quyen doc bao cao giao ban
   * ve rieng nhom quan ly, phai thu hep danh sach nguoi nhan o day cung luc,
   * neu khong thanh vien se bam vao link roi nhan 403.
   */
  private reportUrl(event: {
    workspaceId: string;
    projectId: string;
    reportId: string;
  }) {
    const { appUrl } = mailConfig();

    // Phai khop route frontend: .../ai-reports/team/:reportId
    return `${appUrl}/workspaces/${event.workspaceId}/projects/${event.projectId}/ai-reports/team/${event.reportId}`;
  }
}
