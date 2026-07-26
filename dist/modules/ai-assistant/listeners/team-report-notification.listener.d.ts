import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { MailService } from '../../mail/services/mail.service';
import { ProjectsRepository } from '../../projects/repositories/projects.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { AiReportDocument } from '../schemas/ai-report.schema';
import { AiReportEventsService } from '../services/ai-report-events.service';
export declare class TeamReportNotificationListener implements OnModuleInit {
    private readonly aiReportEvents;
    private readonly mailService;
    private readonly workspaceMembersRepository;
    private readonly projectsRepository;
    private readonly aiReportModel;
    private readonly logger;
    constructor(aiReportEvents: AiReportEventsService, mailService: MailService, workspaceMembersRepository: WorkspaceMembersRepository, projectsRepository: ProjectsRepository, aiReportModel: Model<AiReportDocument> | null);
    onModuleInit(): void;
    private handleEvent;
    private reportUrl;
}
