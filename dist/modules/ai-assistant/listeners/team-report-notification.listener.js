"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TeamReportNotificationListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamReportNotificationListener = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const common_2 = require("@nestjs/common");
const mail_config_1 = require("../../../config/mail.config");
const mail_service_1 = require("../../mail/services/mail.service");
const mail_templates_1 = require("../../mail/templates/mail-templates");
const projects_repository_1 = require("../../projects/repositories/projects.repository");
const workspace_members_repository_1 = require("../../workspaces/repositories/workspace-members.repository");
const ai_report_schema_1 = require("../schemas/ai-report.schema");
const ai_report_events_service_1 = require("../services/ai-report-events.service");
let TeamReportNotificationListener = TeamReportNotificationListener_1 = class TeamReportNotificationListener {
    aiReportEvents;
    mailService;
    workspaceMembersRepository;
    projectsRepository;
    aiReportModel;
    logger = new common_1.Logger(TeamReportNotificationListener_1.name);
    constructor(aiReportEvents, mailService, workspaceMembersRepository, projectsRepository, aiReportModel) {
        this.aiReportEvents = aiReportEvents;
        this.mailService = mailService;
        this.workspaceMembersRepository = workspaceMembersRepository;
        this.projectsRepository = projectsRepository;
        this.aiReportModel = aiReportModel;
    }
    onModuleInit() {
        this.aiReportEvents.onAiReportEvent((event) => this.handleEvent(event));
    }
    async handleEvent(event) {
        if (event.type !== 'team_report_approved')
            return;
        const [members, project, report] = await Promise.all([
            this.workspaceMembersRepository.findActiveByWorkspace(event.workspaceId),
            this.projectsRepository.findByIdAndWorkspace(event.projectId, event.workspaceId),
            this.aiReportModel?.findById(event.reportId).exec() ?? null,
        ]);
        const recipients = members
            .map((member) => ({
            email: member.user?.email?.trim(),
            fullName: member.user?.fullName?.trim(),
        }))
            .filter((member) => Boolean(member.email));
        if (!recipients.length) {
            this.logger.warn(`Khong co thanh vien nao co email trong workspace ${event.workspaceId}, bo qua gui mail bao cao ${event.reportId}.`);
            return;
        }
        const output = (report?.aiOutput ?? {});
        const approver = members.find((member) => member.userId === event.approvedBy);
        const metrics = report?.metrics;
        const reportUrl = this.reportUrl(event);
        for (const recipient of recipients) {
            const mail = (0, mail_templates_1.buildTeamReportApprovedMail)({
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
    reportUrl(event) {
        const { appUrl } = (0, mail_config_1.mailConfig)();
        return `${appUrl}/workspaces/${event.workspaceId}/projects/${event.projectId}/ai-reports/team/${event.reportId}`;
    }
};
exports.TeamReportNotificationListener = TeamReportNotificationListener;
exports.TeamReportNotificationListener = TeamReportNotificationListener = TeamReportNotificationListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_2.Optional)()),
    __param(4, (0, mongoose_1.InjectModel)(ai_report_schema_1.AiReport.name)),
    __metadata("design:paramtypes", [ai_report_events_service_1.AiReportEventsService,
        mail_service_1.MailService,
        workspace_members_repository_1.WorkspaceMembersRepository,
        projects_repository_1.ProjectsRepository, Object])
], TeamReportNotificationListener);
//# sourceMappingURL=team-report-notification.listener.js.map