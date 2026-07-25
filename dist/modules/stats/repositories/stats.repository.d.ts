import { Repository } from 'typeorm';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { Project } from '../../projects/entities/project.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { Task } from '../../tasks/entities/task.entity';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
export type GroupedCount = {
    workspaceId: string;
    total: string;
};
export type StatusCount = {
    status: string;
    total: string;
};
export type DailyCount = {
    day: string;
    total: string;
};
export declare class StatsRepository {
    private readonly workspaceMembersRepository;
    private readonly projectsRepository;
    private readonly tasksRepository;
    private readonly sprintsRepository;
    private readonly meetingsRepository;
    constructor(workspaceMembersRepository: Repository<WorkspaceMember>, projectsRepository: Repository<Project>, tasksRepository: Repository<Task>, sprintsRepository: Repository<Sprint>, meetingsRepository: Repository<Meeting>);
    countProjectsByWorkspace(workspaceIds: string[]): Promise<GroupedCount[]>;
    countMembersByWorkspace(workspaceIds: string[]): Promise<GroupedCount[]>;
    countTasksByWorkspace(workspaceIds: string[]): Promise<GroupedCount[]>;
    countMeetingsByWorkspace(workspaceIds: string[]): Promise<GroupedCount[]>;
    countDistinctMembers(workspaceIds: string[]): Promise<number>;
    countProjectsByStatus(workspaceId: string): Promise<StatusCount[]>;
    countTasksByStatus(workspaceId: string): Promise<StatusCount[]>;
    findActiveSprint(workspaceId: string): Promise<Sprint | null>;
    countSprintTasksByStatus(sprintId: string): Promise<StatusCount[]>;
    findUpcomingTasks(workspaceId: string, limit: number): Promise<Task[]>;
    countCompletedTasksByDay(workspaceId: string, fromDate: Date): Promise<DailyCount[]>;
    countUpcomingMeetings(workspaceId: string, fromDate: string): Promise<number>;
}
