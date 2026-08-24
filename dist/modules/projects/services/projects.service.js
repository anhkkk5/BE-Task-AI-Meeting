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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const crypto_1 = require("crypto");
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
    dataSource;
    constructor(projectsRepository, projectAccessService, projectKeyCodeService, workspaceAccessService, dataSource) {
        this.projectsRepository = projectsRepository;
        this.projectAccessService = projectAccessService;
        this.projectKeyCodeService = projectKeyCodeService;
        this.workspaceAccessService = workspaceAccessService;
        this.dataSource = dataSource;
    }
    async listWorkflowTemplates(currentUserId, workspaceId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        if (!this.dataSource)
            return {
                success: true,
                message: 'Get workflow templates successfully',
                data: { items: [] },
            };
        const templates = (await this.dataSource.query('SELECT * FROM `workflow_templates` ORDER BY `is_system` DESC, `name` ASC'));
        return {
            success: true,
            message: 'Get workflow templates successfully',
            data: { items: templates },
        };
    }
    async createWorkflowTemplate(currentUserId, workspaceId, dto) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        this.assertWorkflow(dto.statuses, dto.transitions);
        if (!this.dataSource)
            throw new common_1.BadRequestException('Workflow storage unavailable');
        const id = (0, crypto_1.randomUUID)();
        await this.dataSource.transaction(async (manager) => {
            await manager.query('INSERT INTO `workflow_templates` (`id`,`name`,`description`,`is_system`) VALUES (?,?,?,0)', [id, dto.name.trim(), dto.description?.trim() || null]);
            for (const status of dto.statuses ?? [])
                await manager.query('INSERT INTO `workflow_statuses` (`id`,`template_id`,`status_key`,`label`,`color`,`category`,`sort_order`,`enabled`) VALUES (?,?,?,?,?,?,?,?)', [
                    (0, crypto_1.randomUUID)(),
                    id,
                    status.key,
                    status.label,
                    status.color,
                    status.category,
                    status.order,
                    status.enabled,
                ]);
            for (const transition of dto.transitions ?? [])
                await manager.query('INSERT INTO `workflow_transitions` (`id`,`template_id`,`from_key`,`to_key`,`allowed_roles`) VALUES (?,?,?,?,?)', [
                    (0, crypto_1.randomUUID)(),
                    id,
                    transition.from,
                    transition.to,
                    transition.roles?.length ? JSON.stringify(transition.roles) : null,
                ]);
        });
        return {
            success: true,
            message: 'Create workflow template successfully',
            data: { id },
        };
    }
    async updateWorkflowTemplate(currentUserId, workspaceId, templateId, dto) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        this.assertWorkflow(dto.statuses, dto.transitions);
        if (!this.dataSource)
            throw new common_1.BadRequestException('Workflow storage unavailable');
        const templates = (await this.dataSource.query('SELECT `is_system` FROM `workflow_templates` WHERE `id`=? LIMIT 1', [templateId]));
        if (!templates.length)
            throw new common_1.NotFoundException('Workflow template not found');
        if (templates[0].is_system)
            throw new common_1.BadRequestException('System workflow template cannot be edited');
        await this.dataSource.transaction(async (manager) => {
            await manager.query('UPDATE `workflow_templates` SET `name`=?,`description`=? WHERE `id`=?', [dto.name.trim(), dto.description?.trim() || null, templateId]);
            await manager.query('UPDATE `workflow_statuses` SET `enabled`=0 WHERE `template_id`=?', [templateId]);
            for (const status of dto.statuses ?? []) {
                const existing = (await manager.query('SELECT `id` FROM `workflow_statuses` WHERE `template_id`=? AND `status_key`=? LIMIT 1', [templateId, status.key]));
                if (existing.length)
                    await manager.query('UPDATE `workflow_statuses` SET `label`=?,`color`=?,`category`=?,`sort_order`=?,`enabled`=? WHERE `id`=?', [
                        status.label,
                        status.color,
                        status.category,
                        status.order,
                        status.enabled,
                        existing[0].id,
                    ]);
                else
                    await manager.query('INSERT INTO `workflow_statuses` (`id`,`template_id`,`status_key`,`label`,`color`,`category`,`sort_order`,`enabled`) VALUES (?,?,?,?,?,?,?,?)', [
                        (0, crypto_1.randomUUID)(),
                        templateId,
                        status.key,
                        status.label,
                        status.color,
                        status.category,
                        status.order,
                        status.enabled,
                    ]);
            }
            await manager.query('DELETE FROM `workflow_transitions` WHERE `template_id`=?', [templateId]);
            for (const transition of dto.transitions ?? [])
                await manager.query('INSERT INTO `workflow_transitions` (`id`,`template_id`,`from_key`,`to_key`,`allowed_roles`) VALUES (?,?,?,?,?)', [
                    (0, crypto_1.randomUUID)(),
                    templateId,
                    transition.from,
                    transition.to,
                    transition.roles?.length ? JSON.stringify(transition.roles) : null,
                ]);
        });
        return {
            success: true,
            message: 'Update workflow template successfully',
            data: { id: templateId },
        };
    }
    async applyWorkflowTemplate(currentUserId, workspaceId, projectId, templateId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const project = await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        if (!this.dataSource)
            throw new common_1.BadRequestException('Workflow storage unavailable');
        const statuses = await this.dataSource.query('SELECT `id` `workflowStatusId`,`status_key` `key`,`label`,`color`,`category`,`sort_order` `order`,`enabled` FROM `workflow_statuses` WHERE `template_id`=? ORDER BY `sort_order`', [templateId]);
        if (!statuses.length)
            throw new common_1.NotFoundException('Workflow template not found');
        const rawTransitions = await this.dataSource.query('SELECT `from_key` `from`,`to_key` `to`,`allowed_roles` `roles` FROM `workflow_transitions` WHERE `template_id`=?', [templateId]);
        const transitions = rawTransitions.map((item) => ({
            ...item,
            roles: typeof item.roles === 'string'
                ? JSON.parse(item.roles)
                : (item.roles ?? undefined),
        }));
        const updated = await this.projectsRepository.update(project, {
            workflowTemplateId: templateId,
            workflowStatuses: statuses,
            workflowTransitions: transitions,
        });
        await this.dataSource.query('UPDATE `tasks` t JOIN `workflow_statuses` s ON s.template_id=? AND s.status_key=t.status SET t.workflow_status_id=s.id WHERE t.project_id=?', [templateId, projectId]);
        return {
            success: true,
            message: 'Apply workflow template successfully',
            data: { project: this.toProjectResponse(updated) },
        };
    }
    async deleteWorkflowTemplate(currentUserId, workspaceId, templateId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        if (!this.dataSource)
            throw new common_1.BadRequestException('Workflow storage unavailable');
        const result = await this.dataSource.query('DELETE FROM `workflow_templates` WHERE `id`=? AND `is_system`=0', [templateId]);
        return {
            success: true,
            message: 'Delete workflow template successfully',
            data: { affected: result.affectedRows ?? 0 },
        };
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
        const taskCounts = await this.projectsRepository.countTasksByProjects(result.items.map((project) => project.id));
        return {
            success: true,
            message: 'Get projects successfully',
            data: {
                items: result.items.map((project) => ({
                    ...this.toProjectResponse(project),
                    ...(taskCounts.get(project.id) ?? {
                        totalTasks: 0,
                        completedTasks: 0,
                    }),
                })),
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
        const workflowStatuses = await this.getNormalizedWorkflowStatuses(project);
        return {
            success: true,
            message: 'Get project detail successfully',
            data: {
                project: {
                    ...this.toProjectResponse(project),
                    workflowStatuses,
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
            workflowStatuses: dto.workflowStatuses ??
                project.workflowStatuses,
            workflowTransitions: dto.workflowTransitions ??
                project.workflowTransitions,
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
            if (new Set(keys).size !== keys.length ||
                keys.some((key) => !valid.has(key)))
                throw new common_1.BadRequestException('Workflow statuses contain duplicate or invalid keys');
            if (!statuses.some((status) => status.key === task_status_enum_1.TaskStatus.Done && status.enabled))
                throw new common_1.BadRequestException('Workflow must keep DONE enabled');
        }
        const validRoles = new Set(Object.values(workspace_role_enum_1.WorkspaceRole));
        if (transitions?.some((transition) => !valid.has(transition.from) ||
            !valid.has(transition.to) ||
            transition.from === transition.to ||
            transition.roles?.some((role) => !validRoles.has(role))))
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
            workflowTemplateId: project.workflowTemplateId,
            createdBy: project.createdBy,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }
    async getNormalizedWorkflowStatuses(project) {
        if (!this.dataSource || !project.workflowTemplateId)
            return project.workflowStatuses ?? default_workflow_1.DEFAULT_WORKFLOW_STATUSES;
        const statuses = await this.dataSource.query('SELECT `id` `workflowStatusId`,`status_key` `key`,`label`,`color`,`category`,`sort_order` `order`,`enabled` FROM `workflow_statuses` WHERE `template_id`=? ORDER BY `sort_order`', [project.workflowTemplateId]);
        return statuses.length
            ? statuses
            : (project.workflowStatuses ?? default_workflow_1.DEFAULT_WORKFLOW_STATUSES);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [projects_repository_1.ProjectsRepository,
        project_access_service_1.ProjectAccessService,
        project_key_code_service_1.ProjectKeyCodeService,
        workspace_access_service_1.WorkspaceAccessService,
        typeorm_1.DataSource])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map