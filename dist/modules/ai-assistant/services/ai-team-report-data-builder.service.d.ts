import { HandoverStatus } from '../../../common/enums/handover-status.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { ShiftHandoversRepository } from '../../shift-handovers/repositories/shift-handovers.repository';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { WorkspaceMembersRepository } from '../../workspaces/repositories/workspace-members.repository';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
type TeamMemberInput = {
    userId: string;
    fullName: string;
    email: string | null;
    role: string;
};
type TeamDailyUpdateInput = {
    id: string;
    userId: string;
    fullName: string;
    updateDate: string;
    yesterdayWork: string;
    todayPlan: string;
    blockers: string | null;
    notes: string | null;
    mood: string | null;
};
type TeamTaskInput = {
    id: string;
    taskCode: string;
    title: string;
    status: string;
    sprintId: string | null;
    assigneeId: string | null;
    assigneeName: string | null;
    dueDate: string | null;
    estimatedHours: number | null;
    storyPoints: number | null;
};
type TeamHandoverInput = {
    id: string;
    taskCode: string | null;
    taskTitle: string | null;
    status: string;
    senderName: string | null;
    receiverName: string | null;
    completedWork: string | null;
    remainingWork: string | null;
    blockers: string | null;
};
export type TeamReportInputData = {
    workspace: {
        id: string;
        name: string;
        slug: string;
    };
    project: {
        id: string;
        name: string;
        keyCode: string;
        status: string;
    };
    sprint: {
        id: string;
        name: string;
        status: string;
        startDate: string;
        endDate: string;
    } | null;
    reportDate: string;
    members: TeamMemberInput[];
    dailyUpdates: TeamDailyUpdateInput[];
    missingDailyUpdateMembers: TeamMemberInput[];
    taskStats: Record<TaskStatus, number>;
    tasks: TeamTaskInput[];
    overdueTasks: TeamTaskInput[];
    blockers: {
        userId: string;
        fullName: string;
        blocker: string;
    }[];
    handovers: TeamHandoverInput[];
    handoverStats: {
        total: number;
        acknowledged: number;
        pending: number;
        changesRequested: number;
        rejected: number;
    };
};
type BuildTeamInputParams = {
    workspaceId: string;
    projectId: string;
    reportDate: string;
    sprintId?: string;
};
export declare class AiTeamReportDataBuilderService {
    private readonly dailyUpdatesRepository;
    private readonly projectAccessService;
    private readonly sprintAccessService;
    private readonly tasksRepository;
    private readonly workspaceAccessService;
    private readonly workspaceMembersRepository;
    private readonly shiftHandoversRepository;
    constructor(dailyUpdatesRepository: DailyUpdatesRepository, projectAccessService: ProjectAccessService, sprintAccessService: SprintAccessService, tasksRepository: TasksRepository, workspaceAccessService: WorkspaceAccessService, workspaceMembersRepository: WorkspaceMembersRepository, shiftHandoversRepository: ShiftHandoversRepository);
    buildTeamReportInput(params: BuildTeamInputParams): Promise<{
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
        project: {
            id: string;
            name: string;
            keyCode: string;
            status: import("../../../common/enums/project-status.enum").ProjectStatus;
        };
        sprint: {
            id: string;
            name: string;
            status: import("../../../common/enums/sprint-status.enum").SprintStatus;
            startDate: string;
            endDate: string;
        } | null;
        reportDate: string;
        members: {
            userId: string;
            fullName: string;
            email: string;
            role: import("../../../common/enums/workspace-role.enum").WorkspaceRole;
        }[];
        dailyUpdates: {
            id: string;
            userId: string;
            fullName: string;
            updateDate: string;
            yesterdayWork: string;
            todayPlan: string;
            blockers: string | null;
            notes: string | null;
            mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
        }[];
        missingDailyUpdateMembers: TeamMemberInput[];
        taskStats: {
            BACKLOG: number;
            TODO: number;
            IN_PROGRESS: number;
            REVIEW: number;
            DONE: number;
            CANCELLED: number;
        };
        tasks: {
            id: string;
            taskCode: string;
            title: string;
            status: TaskStatus;
            sprintId: string | null;
            assigneeId: string | null;
            assigneeName: string | null;
            dueDate: string | null;
            estimatedHours: number | null;
            storyPoints: number | null;
        }[];
        overdueTasks: TeamTaskInput[];
        blockers: {
            userId: string;
            fullName: string;
            blocker: string;
        }[];
        handovers: {
            id: string;
            taskCode: string | null;
            taskTitle: string | null;
            status: HandoverStatus;
            senderName: string;
            receiverName: string;
            completedWork: string | null;
            remainingWork: string | null;
            blockers: string | null;
        }[];
        handoverStats: {
            total: number;
            acknowledged: number;
            pending: number;
            changesRequested: number;
            rejected: number;
        };
    }>;
    getTeamHandovers(projectId: string, reportDate: string): Promise<{
        id: string;
        taskCode: string | null;
        taskTitle: string | null;
        status: HandoverStatus;
        senderName: string;
        receiverName: string;
        completedWork: string | null;
        remainingWork: string | null;
        blockers: string | null;
    }[]>;
    private getHandoverStats;
    getTeamMembers(workspaceId: string): Promise<{
        userId: string;
        fullName: string;
        email: string;
        role: import("../../../common/enums/workspace-role.enum").WorkspaceRole;
    }[]>;
    getTeamDailyUpdates(projectId: string, reportDate: string, sprintId?: string): Promise<{
        id: string;
        userId: string;
        fullName: string;
        updateDate: string;
        yesterdayWork: string;
        todayPlan: string;
        blockers: string | null;
        notes: string | null;
        mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
    }[]>;
    getTeamTasks(projectId: string, sprintId?: string): Promise<{
        id: string;
        taskCode: string;
        title: string;
        status: TaskStatus;
        sprintId: string | null;
        assigneeId: string | null;
        assigneeName: string | null;
        dueDate: string | null;
        estimatedHours: number | null;
        storyPoints: number | null;
    }[]>;
    getTaskStats(tasks: TeamTaskInput[]): {
        BACKLOG: number;
        TODO: number;
        IN_PROGRESS: number;
        REVIEW: number;
        DONE: number;
        CANCELLED: number;
    };
    getOverdueTasks(tasks: TeamTaskInput[], reportDate: string): TeamTaskInput[];
    getMissingDailyUpdateMembers(members: TeamMemberInput[], dailyUpdates: TeamDailyUpdateInput[]): TeamMemberInput[];
    private normalizeDate;
}
export {};
