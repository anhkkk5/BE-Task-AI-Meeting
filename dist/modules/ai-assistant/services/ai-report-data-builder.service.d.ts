import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { ShiftHandoversRepository } from '../../shift-handovers/repositories/shift-handovers.repository';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { UsersService } from '../../users/services/users.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
export type ReportHandoverItem = {
    id: string;
    taskCode: string | null;
    taskTitle: string | null;
    status: string;
    counterpartName: string | null;
    completedWork: string | null;
    remainingWork: string | null;
    blockers: string | null;
    notes: string | null;
};
export type PersonalReportInputData = {
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    };
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
    dailyUpdate: {
        id: string;
        updateDate: string;
        yesterdayWork: string;
        todayPlan: string;
        blockers: string | null;
        notes: string | null;
        mood: string | null;
    } | null;
    tasks: {
        id: string;
        taskCode: string;
        title: string;
        status: string;
        workflowStatusId: string;
        workflowStatusKey: string;
        sprintId: string | null;
        dueDate: string | null;
        estimatedHours: number | null;
        storyPoints: number | null;
    }[];
    taskSummary: {
        completed: string[];
        inProgress: string[];
        overdue: string[];
    };
    handovers: {
        given: ReportHandoverItem[];
        received: ReportHandoverItem[];
        pendingForMe: number;
    };
};
type BuildInputParams = {
    workspaceId: string;
    projectId: string;
    targetUserId: string;
    reportDate: string;
    sprintId?: string;
};
export declare class AiReportDataBuilderService {
    private readonly dailyUpdatesRepository;
    private readonly projectAccessService;
    private readonly sprintAccessService;
    private readonly tasksRepository;
    private readonly usersService;
    private readonly workspaceAccessService;
    private readonly shiftHandoversRepository;
    constructor(dailyUpdatesRepository: DailyUpdatesRepository, projectAccessService: ProjectAccessService, sprintAccessService: SprintAccessService, tasksRepository: TasksRepository, usersService: UsersService, workspaceAccessService: WorkspaceAccessService, shiftHandoversRepository: ShiftHandoversRepository);
    buildPersonalDailyReportInput(params: BuildInputParams): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            role: import("../../../common/enums/workspace-role.enum").WorkspaceRole;
        };
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
        dailyUpdate: {
            id: string;
            updateDate: string;
            yesterdayWork: string;
            todayPlan: string;
            blockers: string | null;
            notes: string | null;
            mood: import("../../../common/enums/daily-mood.enum").DailyMood | null;
        } | null;
        tasks: {
            id: string;
            taskCode: string;
            title: string;
            status: TaskStatus;
            workflowStatusId: string;
            workflowStatusKey: TaskStatus;
            sprintId: string | null;
            dueDate: string | null;
            estimatedHours: number | null;
            storyPoints: number | null;
        }[];
        handovers: {
            given: ReportHandoverItem[];
            received: ReportHandoverItem[];
            pendingForMe: number;
        };
        taskSummary: {
            completed: string[];
            inProgress: string[];
            overdue: string[];
        };
    }>;
    private toHandoverItem;
    private normalizeDate;
}
export {};
