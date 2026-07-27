import { DailyMood } from '../../../common/enums/daily-mood.enum';
import { Project } from '../../projects/entities/project.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';
export declare class DailyUpdate {
    id: string;
    workspaceId: string;
    projectId: string;
    sprintId: string | null;
    userId: string;
    updateDate: string;
    yesterdayWork: string;
    todayPlan: string;
    blockers: string | null;
    needHelpFromId: string | null;
    notes: string | null;
    mood: DailyMood | null;
    workspace: Workspace;
    project: Project;
    sprint: Sprint | null;
    user: User;
    needHelpFrom: User | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
