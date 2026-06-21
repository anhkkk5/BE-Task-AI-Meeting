import { TaskStatus } from '../../../common/enums/task-status.enum';
import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { Sprint } from '../../sprints/entities/sprint.entity';
import { SprintAccessService } from '../../sprints/services/sprint-access.service';
import { Task } from '../entities/task.entity';
import { TasksRepository } from '../repositories/tasks.repository';
export declare class TaskAccessService {
    private readonly tasksRepository;
    private readonly sprintAccessService;
    private readonly workspaceAccessService;
    constructor(tasksRepository: TasksRepository, sprintAccessService: SprintAccessService, workspaceAccessService: WorkspaceAccessService);
    getTaskInProject(taskId: string, projectId: string): Promise<Task | null>;
    assertTaskInProject(taskId: string, projectId: string): Promise<Task>;
    assertTaskEditable(task: Task): void;
    assertAssignableUser(userId: string, workspaceId: string): Promise<import("../../workspaces/entities/workspace-member.entity").WorkspaceMember>;
    assertSprintCanReceiveTask(sprintId: string, projectId: string): Promise<Sprint>;
    assertSprintInProject(sprintId: string, projectId: string): Promise<Sprint>;
    assertUserCanUpdateTaskStatus(userId: string, workspaceId: string, task: Task, nextStatus: TaskStatus): Promise<WorkspaceRole>;
}
