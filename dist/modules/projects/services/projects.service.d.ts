import { WorkspaceRole } from '../../../common/enums/workspace-role.enum';
import { WorkspaceAccessService } from '../../workspaces/services/workspace-access.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ProjectAccessService } from './project-access.service';
import { ProjectKeyCodeService } from './project-key-code.service';
export declare class ProjectsService {
    private readonly projectsRepository;
    private readonly projectAccessService;
    private readonly projectKeyCodeService;
    private readonly workspaceAccessService;
    constructor(projectsRepository: ProjectsRepository, projectAccessService: ProjectAccessService, projectKeyCodeService: ProjectKeyCodeService, workspaceAccessService: WorkspaceAccessService);
    createProject(currentUserId: string, workspaceId: string, dto: CreateProjectDto): Promise<{
        success: boolean;
        message: string;
        data: {
            project: {
                id: string;
                workspaceId: string;
                name: string;
                keyCode: string;
                description: string | null;
                status: import("../../../common/enums/project-status.enum").ProjectStatus;
                startDate: string | null;
                endDate: string | null;
                workflowStatuses: import("../../../common/workflow/default-workflow").WorkflowStatusConfig[];
                workflowTransitions: import("../../../common/workflow/default-workflow").WorkflowTransitionConfig[];
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getProjects(currentUserId: string, workspaceId: string, query: GetProjectsQueryDto): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                workspaceId: string;
                name: string;
                keyCode: string;
                description: string | null;
                status: import("../../../common/enums/project-status.enum").ProjectStatus;
                startDate: string | null;
                endDate: string | null;
                workflowStatuses: import("../../../common/workflow/default-workflow").WorkflowStatusConfig[];
                workflowTransitions: import("../../../common/workflow/default-workflow").WorkflowTransitionConfig[];
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
    getProjectDetail(currentUserId: string, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            project: {
                createdByUser: {
                    id: string;
                    fullName: string;
                    email: string;
                    avatarUrl: string | null;
                } | null;
                id: string;
                workspaceId: string;
                name: string;
                keyCode: string;
                description: string | null;
                status: import("../../../common/enums/project-status.enum").ProjectStatus;
                startDate: string | null;
                endDate: string | null;
                workflowStatuses: import("../../../common/workflow/default-workflow").WorkflowStatusConfig[];
                workflowTransitions: import("../../../common/workflow/default-workflow").WorkflowTransitionConfig[];
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateProject(currentUserId: string, workspaceId: string, projectId: string, dto: UpdateProjectDto): Promise<{
        success: boolean;
        message: string;
        data: {
            project: {
                id: string;
                workspaceId: string;
                name: string;
                keyCode: string;
                description: string | null;
                status: import("../../../common/enums/project-status.enum").ProjectStatus;
                startDate: string | null;
                endDate: string | null;
                workflowStatuses: import("../../../common/workflow/default-workflow").WorkflowStatusConfig[];
                workflowTransitions: import("../../../common/workflow/default-workflow").WorkflowTransitionConfig[];
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    archiveProject(currentUserId: string, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    completeProject(currentUserId: string, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getProjectWriteRoles(): WorkspaceRole[];
    private assertDateRange;
    private assertWorkflow;
    private toProjectResponse;
}
