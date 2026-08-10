import { Repository } from 'typeorm';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { GetTasksQueryDto } from '../dto/get-tasks-query.dto';
import { Task } from '../entities/task.entity';
export declare class TasksRepository {
    private readonly repository;
    constructor(repository: Repository<Task>);
    create(data: Pick<Task, 'assigneeId' | 'createdBy' | 'description' | 'dueDate' | 'estimatedHours' | 'projectId' | 'sprintId' | 'status' | 'storyPoints' | 'taskCode' | 'title'> & Partial<Pick<Task, 'taskType' | 'priority' | 'parentId' | 'labels' | 'acceptanceCriteria' | 'reporterId' | 'completedAt' | 'startedAt' | 'workflowStatusId'>>): Promise<Task>;
    countByProject(projectId: string): Promise<number>;
    findByIdAndProject(taskId: string, projectId: string): Promise<Task | null>;
    findByProject(projectId: string, query: GetTasksQueryDto): Promise<{
        items: Task[];
        total: number;
        page: number;
        limit: number;
    }>;
    findBacklogByProject(projectId: string): Promise<Task[]>;
    findBySprint(projectId: string, sprintId: string): Promise<Task[]>;
    update(task: Task, data: Partial<Task>): Promise<Task>;
    findIncompleteChildren(parentId: string): Promise<Task[]>;
    findChildren(parentId: string): Promise<Task[]>;
    findWorkflowStatusId(templateId: string | null, status: TaskStatus): Promise<string | null>;
    findWorkflowStatus(templateId: string | null, workflowStatusId: string): Promise<{
        id: string;
        key: TaskStatus;
        label: string;
        category: "TO_DO" | "IN_PROGRESS" | "DONE";
        enabled: boolean | number;
    } | null>;
    findWorkflowStatusById(workflowStatusId: string | null): Promise<{
        id: string;
        key: TaskStatus;
        label: string;
        category: "TO_DO" | "IN_PROGRESS" | "DONE";
        enabled: boolean | number;
    } | null>;
    findDueNotificationCandidates(throughDate: string): Promise<Task[]>;
    softDelete(task: Task): Promise<Task>;
    private withDependencyState;
    private blockedExistsSql;
    private blockingExistsSql;
    private attachDependencyState;
}
