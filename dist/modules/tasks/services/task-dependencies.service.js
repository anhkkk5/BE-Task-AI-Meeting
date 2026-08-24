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
exports.TaskDependenciesService = void 0;
const common_1 = require("@nestjs/common");
const task_dependency_type_enum_1 = require("../../../common/enums/task-dependency-type.enum");
const project_access_service_1 = require("../../projects/services/project-access.service");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const task_dependencies_repository_1 = require("../repositories/task-dependencies.repository");
const task_access_service_1 = require("./task-access.service");
let TaskDependenciesService = class TaskDependenciesService {
    repository;
    taskAccessService;
    workspaceAccessService;
    projectAccessService;
    constructor(repository, taskAccessService, workspaceAccessService, projectAccessService) {
        this.repository = repository;
        this.taskAccessService = taskAccessService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
    }
    async list(userId, workspaceId, projectId, taskId) {
        await this.assertAccess(userId, workspaceId, projectId, taskId);
        const items = await this.repository.findByTask(taskId);
        return {
            success: true,
            message: 'Get task dependencies successfully',
            data: { items },
        };
    }
    async create(userId, workspaceId, projectId, sourceTaskId, dto) {
        await this.assertAccess(userId, workspaceId, projectId, sourceTaskId);
        await this.taskAccessService.assertTaskInProject(dto.targetTaskId, projectId);
        if (sourceTaskId === dto.targetTaskId)
            throw new common_1.BadRequestException('Task can not depend on itself');
        if (await this.repository.findDuplicate(sourceTaskId, dto.targetTaskId, dto.type))
            throw new common_1.ConflictException('Task dependency already exists');
        if ([task_dependency_type_enum_1.TaskDependencyType.Blocks, task_dependency_type_enum_1.TaskDependencyType.DependsOn].includes(dto.type)) {
            await this.assertNoCycle(projectId, sourceTaskId, dto.targetTaskId, dto.type);
        }
        const dependency = await this.repository.create({
            sourceTaskId,
            targetTaskId: dto.targetTaskId,
            type: dto.type,
            createdBy: userId,
        });
        return {
            success: true,
            message: 'Create task dependency successfully',
            data: { dependency },
        };
    }
    async remove(userId, workspaceId, projectId, taskId, dependencyId) {
        await this.assertAccess(userId, workspaceId, projectId, taskId);
        const item = await this.repository.findOwned(dependencyId);
        if (!item || (item.sourceTaskId !== taskId && item.targetTaskId !== taskId))
            throw new common_1.NotFoundException('Task dependency not found');
        await this.repository.remove(item);
        return {
            success: true,
            message: 'Delete task dependency successfully',
            data: null,
        };
    }
    async assertAccess(userId, workspaceId, projectId, taskId) {
        await this.workspaceAccessService.assertWorkspaceMember(userId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        return this.taskAccessService.assertTaskInProject(taskId, projectId);
    }
    async assertNoCycle(projectId, source, target, type) {
        const edges = (await this.repository.findByProject(projectId)).filter((item) => [task_dependency_type_enum_1.TaskDependencyType.Blocks, task_dependency_type_enum_1.TaskDependencyType.DependsOn].includes(item.type));
        const graph = new Map();
        const add = (from, to) => graph.set(from, [...(graph.get(from) ?? []), to]);
        edges.forEach((item) => item.type === task_dependency_type_enum_1.TaskDependencyType.Blocks
            ? add(item.sourceTaskId, item.targetTaskId)
            : add(item.targetTaskId, item.sourceTaskId));
        const from = type === task_dependency_type_enum_1.TaskDependencyType.Blocks ? source : target;
        const to = type === task_dependency_type_enum_1.TaskDependencyType.Blocks ? target : source;
        const seen = new Set();
        const reaches = (node) => node === from ||
            (!seen.has(node) &&
                (seen.add(node), (graph.get(node) ?? []).some(reaches)));
        if (reaches(to))
            throw new common_1.BadRequestException('This dependency would create a cycle');
    }
};
exports.TaskDependenciesService = TaskDependenciesService;
exports.TaskDependenciesService = TaskDependenciesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [task_dependencies_repository_1.TaskDependenciesRepository,
        task_access_service_1.TaskAccessService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService])
], TaskDependenciesService);
//# sourceMappingURL=task-dependencies.service.js.map