"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const workspace_role_enum_1 = require("../../../common/enums/workspace-role.enum");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const default_workflow_1 = require("../../../common/workflow/default-workflow");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const projects_repository_1 = require("../repositories/projects.repository");
const project_access_service_1 = require("./project-access.service");
const project_key_code_service_1 = require("./project-key-code.service");
const projectWriteRoles = [
    workspace_role_enum_1.WorkspaceRole.Owner,
    workspace_role_enum_1.WorkspaceRole.ScrumMaster,
    workspace_role_enum_1.WorkspaceRole.ProjectManager,
];
let ProjectsService = class ProjectsService {
    projectsRepository;
    projectAccessService;
    projectKeyCodeService;
    workspaceAccessService;
    constructor(projectsRepository, projectAccessService, projectKeyCodeService, workspaceAccessService) {
        this.projectsRepository = projectsRepository;
        this.projectAccessService = projectAccessService;
        this.projectKeyCodeService = projectKeyCodeService;
        this.workspaceAccessService = workspaceAccessService;
    }
    async createProject(currentUserId, workspaceId, dto) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        this.assertDateRange(dto.startDate, dto.endDate);
        const name = dto.name.trim();
        const keyCode = await this.projectKeyCodeService.generateUniqueKeyCode(workspaceId, name);
        const project = await this.projectsRepository.create({
            workspaceId,
            name,
            keyCode,
            description: dto.description?.trim() || null,
            startDate: dto.startDate ?? null,
            endDate: dto.endDate ?? null,
            createdBy: currentUserId,
        });
        return {
            success: true,
            message: 'Create project successfully',
            data: {
                project: this.toProjectResponse(project),
            },
        };
    }
    async getProjects(currentUserId, workspaceId, query) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const result = await this.projectsRepository.findByWorkspace(workspaceId, query);
        return {
            success: true,
            message: 'Get projects successfully',
            data: {
                items: result.items.map((project) => this.toProjectResponse(project)),
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                },
            },
        };
    }
    async getProjectDetail(currentUserId, workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const project = await this.projectAccessService.assertProjectDetailInWorkspace(projectId, workspaceId);
        return {
            success: true,
            message: 'Get project detail successfully',
            data: {
                project: {
                    ...this.toProjectResponse(project),
                    createdByUser: project.creator
                        ? {
                            id: project.creator.id,
                            fullName: project.creator.fullName,
                            email: project.creator.email,
                            avatarUrl: project.creator.avatarUrl,
                        }
                        : null,
                },
            },
        };
    }
    async updateProject(currentUserId, workspaceId, projectId, dto) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        this.assertDateRange(dto.startDate, dto.endDate);
        const project = await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        this.assertWorkflow(dto.workflowStatuses, dto.workflowTransitions);
        const updatedProject = await this.projectsRepository.update(project, {
            name: dto.name?.trim() ?? project.name,
            description: dto.description === undefined
                ? project.description
                : dto.description.trim() || null,
            startDate: dto.startDate ?? project.startDate,
            endDate: dto.endDate ?? project.endDate,
            workflowStatuses: dto.workflowStatuses ?? project.workflowStatuses,
            workflowTransitions: dto.workflowTransitions ?? project.workflowTransitions,
        });
        return {
            success: true,
            message: 'Update project successfully',
            data: {
                project: this.toProjectResponse(updatedProject),
            },
        };
    }
    async archiveProject(currentUserId, workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const project = await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.projectsRepository.archive(project);
        return {
            success: true,
            message: 'Archive project successfully',
            data: null,
        };
    }
    async completeProject(currentUserId, workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const project = await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        await this.projectsRepository.complete(project);
        return {
            success: true,
            message: 'Complete project successfully',
            data: null,
        };
    }
    getProjectWriteRoles() {
        return projectWriteRoles;
    }
    assertDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            return;
        }
        if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
            throw new common_1.BadRequestException('endDate must not be earlier than startDate');
        }
    }
    assertWorkflow(statuses, transitions) {
        if (!statuses && !transitions)
            return;
        const valid = new Set(Object.values(task_status_enum_1.TaskStatus));
        if (statuses) {
            const keys = statuses.map((status) => status.key);
            if (new Set(keys).size !== keys.length || keys.some((key) => !valid.has(key)))
                throw new common_1.BadRequestException('Workflow statuses contain duplicate or invalid keys');
            if (!statuses.some((status) => status.key === task_status_enum_1.TaskStatus.Done && status.enabled))
                throw new common_1.BadRequestException('Workflow must keep DONE enabled');
        }
        const validRoles = new Set(Object.values(workspace_role_enum_1.WorkspaceRole));
        if (transitions?.some((transition) => !valid.has(transition.from) || !valid.has(transition.to) || transition.from === transition.to || transition.roles?.some((role) => !validRoles.has(role))))
            throw new common_1.BadRequestException('Workflow contains invalid transitions or roles');
    }
    toProjectResponse(project) {
        return {
            id: project.id,
            workspaceId: project.workspaceId,
            name: project.name,
            keyCode: project.keyCode,
            description: project.description,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            workflowStatuses: project.workflowStatuses ?? default_workflow_1.DEFAULT_WORKFLOW_STATUSES,
            workflowTransitions: project.workflowTransitions ?? default_workflow_1.DEFAULT_WORKFLOW_TRANSITIONS,
            createdBy: project.createdBy,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [projects_repository_1.ProjectsRepository,
        project_access_service_1.ProjectAccessService,
        project_key_code_service_1.ProjectKeyCodeService,
        workspace_access_service_1.WorkspaceAccessService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map