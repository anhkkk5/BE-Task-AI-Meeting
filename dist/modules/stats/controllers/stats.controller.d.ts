import type { AuthUser } from '../../auth/types/auth-user.type';
import { StatsService } from '../services/stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getWorkspacesOverview(user: AuthUser): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                workspaces: number;
                projects: number;
                members: number;
                meetings: number;
                tasks: number;
            };
            workspaces: {
                workspaceId: string;
                projectCount: number;
                memberCount: number;
                taskCount: number;
                meetingCount: number;
                updatedAt: Date;
            }[];
        };
    }>;
    getWorkspaceDashboard(user: AuthUser, workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                totalProjects: number;
                activeProjects: number;
                completedProjects: number;
                totalTasks: number;
                doneTasks: number;
                totalMembers: number;
                upcomingMeetings: number;
                completionRate: number;
            };
            taskStatusBreakdown: {
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                total: number;
            }[];
            sprint: ({
                id: string;
                name: string;
                projectId: string;
                projectName: string;
                startDate: string;
                endDate: string;
            } & {
                totalTasks: number;
                doneTasks: number;
                progress: number;
            }) | null;
            productivity: {
                date: string;
                completed: number;
            }[];
            upcomingTasks: {
                id: string;
                taskCode: string;
                title: string;
                status: import("../../../common/enums/task-status.enum").TaskStatus;
                dueDate: string | null;
                projectId: string;
                projectName: string;
                assigneeName: string | null;
            }[];
            members: {
                id: string;
                userId: string;
                role: import("../../../common/enums/workspace-role.enum").WorkspaceRole;
                fullName: string;
                avatarUrl: string | null;
            }[];
        };
    }>;
}
