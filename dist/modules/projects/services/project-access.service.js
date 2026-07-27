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
exports.ProjectAccessService = void 0;
const common_1 = require("@nestjs/common");
const project_status_enum_1 = require("../../../common/enums/project-status.enum");
const projects_repository_1 = require("../repositories/projects.repository");
let ProjectAccessService = class ProjectAccessService {
    projectsRepository;
    constructor(projectsRepository) {
        this.projectsRepository = projectsRepository;
    }
    getProjectInWorkspace(projectId, workspaceId) {
        return this.projectsRepository.findByIdAndWorkspace(projectId, workspaceId);
    }
    async assertProjectInWorkspace(projectId, workspaceId) {
        const project = await this.getProjectInWorkspace(projectId, workspaceId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found in this workspace');
        }
        return project;
    }
    async assertProjectDetailInWorkspace(projectId, workspaceId) {
        const project = await this.projectsRepository.findDetailByIdAndWorkspace(projectId, workspaceId);
        if (!project) {
            throw new common_1.NotFoundException('Project not found in this workspace');
        }
        return project;
    }
    async assertProjectActive(projectId, workspaceId) {
        const project = await this.assertProjectInWorkspace(projectId, workspaceId);
        if (project.status !== project_status_enum_1.ProjectStatus.Active) {
            throw new common_1.NotFoundException('Project not found in this workspace');
        }
        return project;
    }
};
exports.ProjectAccessService = ProjectAccessService;
exports.ProjectAccessService = ProjectAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [projects_repository_1.ProjectsRepository])
], ProjectAccessService);
//# sourceMappingURL=project-access.service.js.map