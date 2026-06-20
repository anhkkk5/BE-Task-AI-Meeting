import { SprintStatus } from '../../../common/enums/sprint-status.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { ProjectAccessService } from '../../projects/services/project-access.service';
import { CreateSprintDto } from '../dto/create-sprint.dto';
import { GetSprintsQueryDto } from '../dto/get-sprints-query.dto';
import { UpdateSprintDto } from '../dto/update-sprint.dto';
import { SprintsRepository } from '../repositories/sprints.repository';
import { SprintAccessService } from './sprint-access.service';
export declare class SprintsService {
    private readonly sprintsRepository;
    private readonly sprintAccessService;
    private readonly workspaceAccessService;
    private readonly projectAccessService;
    constructor(sprintsRepository: SprintsRepository, sprintAccessService: SprintAccessService, workspaceAccessService: WorkspaceAccessService, projectAccessService: ProjectAccessService);
    createSprint(currentUserId: string, workspaceId: string, projectId: string, dto: CreateSprintDto): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: SprintStatus;
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
    getSprints(currentUserId: string, workspaceId: string, projectId: string, query: GetSprintsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: SprintStatus;
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
    getSprintDetail(currentUserId: string, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: SprintStatus;
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
    updateSprint(currentUserId: string, workspaceId: string, projectId: string, sprintId: string, dto: UpdateSprintDto): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: SprintStatus;
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
    startSprint(currentUserId: string, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: SprintStatus;
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
    completeSprint(currentUserId: string, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            sprint: {
                id: string;
                projectId: string;
                name: string;
                goal: string | null;
                status: SprintStatus;
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
    cancelSprint(currentUserId: string, workspaceId: string, projectId: string, sprintId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    private assertWritableProject;
    private assertDateRange;
    private toSprintResponse;
}
