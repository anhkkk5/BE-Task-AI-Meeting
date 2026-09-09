import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { CreateDailyUpdateDto } from '../dto/create-daily-update.dto';
import { GetDailyUpdatesQueryDto } from '../dto/get-daily-updates-query.dto';
import { UpdateDailyUpdateDto } from '../dto/update-daily-update.dto';
import { DailyUpdatesRepository } from '../repositories/daily-updates.repository';
import { DailyUpdateAccessService } from './daily-update-access.service';
import { DailyUpdateSubmissionStatus } from '../../../common/enums/daily-update-submission-status.enum';
export declare class DailyUpdatesService {
    private readonly dailyUpdatesRepository;
    private readonly dailyUpdateAccessService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    private readonly sprintAccessService;
    constructor(dailyUpdatesRepository: DailyUpdatesRepository, dailyUpdateAccessService: DailyUpdateAccessService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService, sprintAccessService: SprintAccessService);
    createDailyUpdate(currentUserId: string, workspaceId: string, projectId: string, dto: CreateDailyUpdateDto): Promise<{
        success: boolean;
        message: string;
        data: {
            dailyUpdate: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string;
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                updateDate: string;
                yesterdayWork: string;
                todayPlan: string;
                blockers: string | null;
                needHelpFromId: string | null;
                needHelpFrom: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                notes: string | null;
                mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
                submissionStatus: DailyUpdateSubmissionStatus;
                generatedByAi: boolean;
                submittedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getMyReviewDraft(currentUserId: string, workspaceId: string, projectId: string, updateDate: string): Promise<{
        success: boolean;
        message: string;
        data: {
            draft: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string;
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                updateDate: string;
                yesterdayWork: string;
                todayPlan: string;
                blockers: string | null;
                needHelpFromId: string | null;
                needHelpFrom: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                notes: string | null;
                mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
                submissionStatus: DailyUpdateSubmissionStatus;
                generatedByAi: boolean;
                submittedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
    }>;
    getMyDailyUpdates(currentUserId: string, workspaceId: string, projectId: string, query: GetDailyUpdatesQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string;
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                updateDate: string;
                yesterdayWork: string;
                todayPlan: string;
                blockers: string | null;
                needHelpFromId: string | null;
                needHelpFrom: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                notes: string | null;
                mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
                submissionStatus: DailyUpdateSubmissionStatus;
                generatedByAi: boolean;
                submittedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
    getTeamDailyUpdates(currentUserId: string, workspaceId: string, projectId: string, query: GetDailyUpdatesQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string;
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                updateDate: string;
                yesterdayWork: string;
                todayPlan: string;
                blockers: string | null;
                needHelpFromId: string | null;
                needHelpFrom: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                notes: string | null;
                mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
                submissionStatus: DailyUpdateSubmissionStatus;
                generatedByAi: boolean;
                submittedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
    getDailyUpdateDetail(currentUserId: string, workspaceId: string, projectId: string, dailyUpdateId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            dailyUpdate: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string;
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                updateDate: string;
                yesterdayWork: string;
                todayPlan: string;
                blockers: string | null;
                needHelpFromId: string | null;
                needHelpFrom: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                notes: string | null;
                mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
                submissionStatus: DailyUpdateSubmissionStatus;
                generatedByAi: boolean;
                submittedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateDailyUpdate(currentUserId: string, workspaceId: string, projectId: string, dailyUpdateId: string, dto: UpdateDailyUpdateDto): Promise<{
        success: boolean;
        message: string;
        data: {
            dailyUpdate: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string;
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                updateDate: string;
                yesterdayWork: string;
                todayPlan: string;
                blockers: string | null;
                needHelpFromId: string | null;
                needHelpFrom: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                notes: string | null;
                mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
                submissionStatus: DailyUpdateSubmissionStatus;
                generatedByAi: boolean;
                submittedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    archiveDailyUpdate(currentUserId: string, workspaceId: string, projectId: string, dailyUpdateId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    restoreDailyUpdate(currentUserId: string, workspaceId: string, projectId: string, dailyUpdateId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            dailyUpdate: {
                id: string;
                workspaceId: string;
                projectId: string;
                sprintId: string | null;
                userId: string;
                user: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                sprint: {
                    id: string;
                    name: string;
                    status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                } | null;
                updateDate: string;
                yesterdayWork: string;
                todayPlan: string;
                blockers: string | null;
                needHelpFromId: string | null;
                needHelpFrom: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                notes: string | null;
                mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
                submissionStatus: DailyUpdateSubmissionStatus;
                generatedByAi: boolean;
                submittedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
    }>;
    private assertValidDailyUpdateFilters;
    private assertNeedHelpFromMember;
    private normalizeDate;
    private optionalText;
    private toDailyUpdateResponse;
}
