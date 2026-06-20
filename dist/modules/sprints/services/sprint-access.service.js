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
exports.SprintAccessService = void 0;
const common_1 = require("@nestjs/common");
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const sprints_repository_1 = require("../repositories/sprints.repository");
let SprintAccessService = class SprintAccessService {
    sprintsRepository;
    constructor(sprintsRepository) {
        this.sprintsRepository = sprintsRepository;
    }
    getSprintInProject(sprintId, projectId) {
        return this.sprintsRepository.findByIdAndProject(sprintId, projectId);
    }
    async assertSprintInProject(sprintId, projectId) {
        const sprint = await this.getSprintInProject(sprintId, projectId);
        if (!sprint) {
            throw new common_1.NotFoundException('Sprint not found in this project');
        }
        return sprint;
    }
    async assertSprintPlanned(sprintId, projectId) {
        const sprint = await this.assertSprintInProject(sprintId, projectId);
        if (sprint.status !== sprint_status_enum_1.SprintStatus.Planned) {
            throw new common_1.BadRequestException('Only planned sprint can be updated');
        }
        return sprint;
    }
    async assertSprintActive(sprintId, projectId) {
        const sprint = await this.assertSprintInProject(sprintId, projectId);
        if (sprint.status !== sprint_status_enum_1.SprintStatus.Active) {
            throw new common_1.BadRequestException('Only active sprint can be completed');
        }
        return sprint;
    }
    async assertProjectHasNoActiveSprint(projectId, sprintId) {
        const activeSprint = await this.sprintsRepository.findActiveByProject(projectId);
        if (activeSprint && activeSprint.id !== sprintId) {
            throw new common_1.ConflictException('This project already has an active sprint');
        }
    }
};
exports.SprintAccessService = SprintAccessService;
exports.SprintAccessService = SprintAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sprints_repository_1.SprintsRepository])
], SprintAccessService);
//# sourceMappingURL=sprint-access.service.js.map