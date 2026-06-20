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
exports.SprintsService = void 0;
const common_1 = require("@nestjs/common");
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const workspace_access_service_1 = require("../../workspaces/services/workspace-access.service");
const project_access_service_1 = require("../../projects/services/project-access.service");
const sprints_repository_1 = require("../repositories/sprints.repository");
const sprint_access_service_1 = require("./sprint-access.service");
let SprintsService = class SprintsService {
    sprintsRepository;
    sprintAccessService;
    workspaceAccessService;
    projectAccessService;
    constructor(sprintsRepository, sprintAccessService, workspaceAccessService, projectAccessService) {
        this.sprintsRepository = sprintsRepository;
        this.sprintAccessService = sprintAccessService;
        this.workspaceAccessService = workspaceAccessService;
        this.projectAccessService = projectAccessService;
    }
    async createSprint(currentUserId, workspaceId, projectId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        this.assertDateRange(dto.startDate, dto.endDate);
        const sprint = await this.sprintsRepository.create({
            projectId,
            name: dto.name.trim(),
            goal: dto.goal?.trim() || null,
            startDate: dto.startDate,
            endDate: dto.endDate,
            createdBy: currentUserId,
        });
        return {
            success: true,
            message: 'Create sprint successfully',
            data: {
                sprint: this.toSprintResponse(sprint),
            },
        };
    }
    async getSprints(currentUserId, workspaceId, projectId, query) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const result = await this.sprintsRepository.findByProject(projectId, query);
        return {
            success: true,
            message: 'Get sprints successfully',
            data: {
                items: result.items.map((sprint) => this.toSprintResponse(sprint)),
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                },
            },
        };
    }
    async getSprintDetail(currentUserId, workspaceId, projectId, sprintId) {
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        await this.projectAccessService.assertProjectInWorkspace(projectId, workspaceId);
        const sprint = await this.sprintAccessService.assertSprintInProject(sprintId, projectId);
        return {
            success: true,
            message: 'Get sprint detail successfully',
            data: {
                sprint: this.toSprintResponse(sprint),
            },
        };
    }
    async updateSprint(currentUserId, workspaceId, projectId, sprintId, dto) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const sprint = await this.sprintAccessService.assertSprintPlanned(sprintId, projectId);
        const nextStartDate = dto.startDate ?? sprint.startDate;
        const nextEndDate = dto.endDate ?? sprint.endDate;
        this.assertDateRange(nextStartDate, nextEndDate);
        const updatedSprint = await this.sprintsRepository.update(sprint, {
            name: dto.name?.trim() ?? sprint.name,
            goal: dto.goal === undefined ? sprint.goal : dto.goal.trim() || null,
            startDate: nextStartDate,
            endDate: nextEndDate,
        });
        return {
            success: true,
            message: 'Update sprint successfully',
            data: {
                sprint: this.toSprintResponse(updatedSprint),
            },
        };
    }
    async startSprint(currentUserId, workspaceId, projectId, sprintId) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const sprint = await this.sprintAccessService.assertSprintPlanned(sprintId, projectId);
        await this.sprintAccessService.assertProjectHasNoActiveSprint(projectId, sprintId);
        const updatedSprint = await this.sprintsRepository.update(sprint, {
            status: sprint_status_enum_1.SprintStatus.Active,
            startedAt: new Date(),
        });
        return {
            success: true,
            message: 'Start sprint successfully',
            data: {
                sprint: this.toSprintResponse(updatedSprint),
            },
        };
    }
    async completeSprint(currentUserId, workspaceId, projectId, sprintId) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const sprint = await this.sprintAccessService.assertSprintActive(sprintId, projectId);
        const updatedSprint = await this.sprintsRepository.update(sprint, {
            status: sprint_status_enum_1.SprintStatus.Completed,
            completedAt: new Date(),
        });
        return {
            success: true,
            message: 'Complete sprint successfully',
            data: {
                sprint: this.toSprintResponse(updatedSprint),
            },
        };
    }
    async cancelSprint(currentUserId, workspaceId, projectId, sprintId) {
        await this.assertWritableProject(workspaceId, projectId);
        await this.workspaceAccessService.assertWorkspaceMember(currentUserId, workspaceId);
        const sprint = await this.sprintAccessService.assertSprintInProject(sprintId, projectId);
        if (![sprint_status_enum_1.SprintStatus.Planned, sprint_status_enum_1.SprintStatus.Active].includes(sprint.status)) {
            throw new common_1.BadRequestException('Only planned or active sprint can be cancelled');
        }
        await this.sprintsRepository.update(sprint, {
            status: sprint_status_enum_1.SprintStatus.Cancelled,
        });
        return {
            success: true,
            message: 'Cancel sprint successfully',
            data: null,
        };
    }
    async assertWritableProject(workspaceId, projectId) {
        await this.workspaceAccessService.assertWorkspaceActive(workspaceId);
        await this.projectAccessService.assertProjectActive(projectId, workspaceId);
    }
    assertDateRange(startDate, endDate) {
        if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
            throw new common_1.BadRequestException('endDate must not be earlier than startDate');
        }
    }
    toSprintResponse(sprint) {
        return {
            id: sprint.id,
            projectId: sprint.projectId,
            name: sprint.name,
            goal: sprint.goal,
            status: sprint.status,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            startedAt: sprint.startedAt,
            completedAt: sprint.completedAt,
            createdBy: sprint.createdBy,
            createdAt: sprint.createdAt,
            updatedAt: sprint.updatedAt,
        };
    }
};
exports.SprintsService = SprintsService;
exports.SprintsService = SprintsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sprints_repository_1.SprintsRepository,
        sprint_access_service_1.SprintAccessService,
        workspace_access_service_1.WorkspaceAccessService,
        project_access_service_1.ProjectAccessService])
], SprintsService);
//# sourceMappingURL=sprints.service.js.map