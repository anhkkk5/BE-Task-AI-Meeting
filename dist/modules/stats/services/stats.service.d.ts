import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { StatsRepository } from '../repositories/stats.repository';
export declare class StatsService {
    private readonly statsRepository;
    private readonly workspaceMembersRepository;
    private readonly workspaceAccessService;
    constructor(statsRepository: StatsRepository, workspaceMembersRepository: WorkspaceMembersRepository, workspaceAccessService: WorkspaceAccessService);
    getWorkspacesOverview(userId: string): Promise<{
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
    getWorkspaceDashboard(userId: string, workspaceId: string): Promise<{
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
                status: TaskStatus;
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
                status: TaskStatus;
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
    private buildSprintProgress;
    private buildProductivitySeries;
    private toCountMap;
    private toStatusMap;
    private sumMap;
    private toDateOnly;
}
