import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateDailyUpdateDto } from '../dto/create-daily-update.dto';
import { GetDailyUpdatesQueryDto } from '../dto/get-daily-updates-query.dto';
import { UpdateDailyUpdateDto } from '../dto/update-daily-update.dto';
import { DailyUpdatesService } from '../services/daily-updates.service';
export declare class DailyUpdatesController {
    private readonly dailyUpdatesService;
    constructor(dailyUpdatesService: DailyUpdatesService);
    createDailyUpdate(user: AuthUser, workspaceId: string, projectId: string, dto: CreateDailyUpdateDto): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getMyDailyUpdates(user: AuthUser, workspaceId: string, projectId: string, query: GetDailyUpdatesQueryDto): Promise<{
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
    getTeamDailyUpdates(user: AuthUser, workspaceId: string, projectId: string, query: GetDailyUpdatesQueryDto): Promise<{
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
    getDailyUpdateDetail(user: AuthUser, workspaceId: string, projectId: string, dailyUpdateId: string): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateDailyUpdate(user: AuthUser, workspaceId: string, projectId: string, dailyUpdateId: string, dto: UpdateDailyUpdateDto): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    archiveDailyUpdate(user: AuthUser, workspaceId: string, projectId: string, dailyUpdateId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
