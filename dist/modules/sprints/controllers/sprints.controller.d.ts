import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { GetSprintsQueryDto } from '../dto/get-sprints-query.dto';
import { UpdateSprintDto } from '../dto/update-sprint.dto';
import { SprintsService } from '../services/sprints.service';
export declare class SprintsController {
    private readonly sprintsService;
    constructor(sprintsService: SprintsService);
    createSprint(user: AuthUser, workspaceId: string, projectId: string, dto: CreateSprintDto): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                startDate: string;
                endDate: string;
                startedAt: Date | null;
                completedAt: Date | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getSprints(user: AuthUser, workspaceId: string, projectId: string, query: GetSprintsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                startDate: string;
                endDate: string;
                startedAt: Date | null;
                completedAt: Date | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
            };
        };
    }>;
    getSprintDetail(user: AuthUser, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                startDate: string;
                endDate: string;
                startedAt: Date | null;
                completedAt: Date | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateSprint(user: AuthUser, workspaceId: string, projectId: string, sprintId: string, dto: UpdateSprintDto): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                startDate: string;
                endDate: string;
                startedAt: Date | null;
                completedAt: Date | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    startSprint(user: AuthUser, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                startDate: string;
                endDate: string;
                startedAt: Date | null;
                completedAt: Date | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    completeSprint(user: AuthUser, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: import("../../../common/enums/sprint-status.enum").SprintStatus;
                startDate: string;
                endDate: string;
                startedAt: Date | null;
                completedAt: Date | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    cancelSprint(user: AuthUser, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    deleteSprint(user: AuthUser, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
