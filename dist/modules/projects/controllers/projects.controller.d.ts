import type { AuthUser } from '../../auth/types/auth-user.type';
import { CreateProjectDto } from '../dto/create-project.dto';
import { GetProjectsQueryDto } from '../dto/get-projects-query.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsService } from '../services/projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    listWorkflowTemplates(user: AuthUser, workspaceId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: Record<string, unknown>[];
        };
    }>;
    createWorkflowTemplate(user: AuthUser, workspaceId: string, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: `${string}-${string}-${string}-${string}-${string}`;
        };
    }>;
    updateWorkflowTemplate(user: AuthUser, workspaceId: string, templateId: string, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
        };
    }>;
    deleteWorkflowTemplate(user: AuthUser, workspaceId: string, templateId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            affected: any;
        };
    }>;
    applyWorkflowTemplate(user: AuthUser, workspaceId: string, projectId: string, templateId: string): Promise<{
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
                workflowTemplateId: string | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    createProject(user: AuthUser, workspaceId: string, dto: CreateProjectDto): Promise<{
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
                workflowTemplateId: string | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    getProjects(user: AuthUser, workspaceId: string, query: GetProjectsQueryDto): Promise<{
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
                workflowTemplateId: string | null;
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
    getProjectDetail(user: AuthUser, workspaceId: string, projectId: string): Promise<{
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
                workflowTemplateId: string | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    updateProject(user: AuthUser, workspaceId: string, projectId: string, dto: UpdateProjectDto): Promise<{
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
                workflowTemplateId: string | null;
                createdBy: string;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    archiveProject(user: AuthUser, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    completeProject(user: AuthUser, workspaceId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
}
