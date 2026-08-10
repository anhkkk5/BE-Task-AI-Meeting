import { ProjectAccessService } from '../../projects/services/project-access.service';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateTaskDependencyDto } from '../dto/create-task-dependency.dto';
import { TaskDependenciesRepository } from '../repositories/task-dependencies.repository';
import { TaskAccessService } from './task-access.service';
export declare class TaskDependenciesService {
    private readonly repository;
    private readonly taskAccessService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    constructor(repository: TaskDependenciesRepository, taskAccessService: TaskAccessService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService);
    list(userId: string, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: import("../entities/task-dependency.entity").TaskDependency[];
        };
    }>;
    create(userId: string, workspaceId: string, projectId: string, sourceTaskId: string, dto: CreateTaskDependencyDto): Promise<{
        success: boolean;
        message: string;
        data: {
            dependency: import("../entities/task-dependency.entity").TaskDependency;
        };
    }>;
    remove(userId: string, workspaceId: string, projectId: string, taskId: string, dependencyId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    private assertAccess;
    private assertNoCycle;
}
