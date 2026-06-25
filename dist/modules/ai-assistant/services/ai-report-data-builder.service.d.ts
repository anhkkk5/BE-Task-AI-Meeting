import { TaskStatus } from '../../../common/enums/task-status.enum';
import { DailyUpdatesRepository } from '../../daily-updates/repositories/daily-updates.repository';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { TasksRepository } from '../../tasks/repositories/tasks.repository';
import { UsersService } from '../../users/services/users.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
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
        priority: string;
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
    constructor(dailyUpdatesRepository: DailyUpdatesRepository, projectAccessService: ProjectAccessService, sprintAccessService: SprintAccessService, tasksRepository: TasksRepository, usersService: UsersService, workspaceAccessService: WorkspaceAccessService);
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
            priority: import("../../../common/enums/task-priority.enum").TaskPriority;
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
    }>;
    private normalizeDate;
}
export {};
