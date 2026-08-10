import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateTaskDependencyDto } from '../dto/create-task-dependency.dto';
import { TaskDependenciesService } from '../services/task-dependencies.service';
export declare class TaskDependenciesController {
    private readonly service;
    constructor(service: TaskDependenciesService);
    list(user: AuthUser, workspaceId: string, projectId: string, taskId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: import("../entities/task-dependency.entity").TaskDependency[];
        };
    }>;
    create(user: AuthUser, workspaceId: string, projectId: string, taskId: string, dto: CreateTaskDependencyDto): Promise<{
        success: boolean;
        message: string;
        data: {
            dependency: import("../entities/task-dependency.entity").TaskDependency;
        };
    }>;
    remove(user: AuthUser, workspaceId: string, projectId: string, taskId: string, dependencyId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
