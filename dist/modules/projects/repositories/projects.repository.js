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
exports.ProjectsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_status_enum_1 = require("../../../common/enums/project-status.enum");
const project_entity_1 = require("../entities/project.entity");
let ProjectsRepository = class ProjectsRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        const project = this.repository.create(data);
        return this.repository.save(project);
    }
    findByIdAndWorkspace(projectId, workspaceId) {
        return this.repository.findOne({
            where: {
                id: projectId,
                workspaceId,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
        });
    }
    findDetailByIdAndWorkspace(projectId, workspaceId) {
        return this.repository.findOne({
            where: {
                id: projectId,
                workspaceId,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
            relations: { creator: true },
        });
    }
    async findKeyCodesByPrefix(workspaceId, prefix) {
        const rows = await this.repository
            .createQueryBuilder('project')
            .select('project.keyCode', 'keyCode')
            .withDeleted()
            .where('project.workspaceId = :workspaceId', { workspaceId })
            .andWhere('project.keyCode LIKE :prefix', { prefix: `${prefix}%` })
            .getRawMany();
        return rows.map((row) => row.keyCode);
    }
    async findByWorkspace(workspaceId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const builder = this.repository
            .createQueryBuilder('project')
            .where('project.workspaceId = :workspaceId', { workspaceId })
            .andWhere('project.deletedAt IS NULL');
        if (query.status) {
            builder.andWhere('project.status = :status', { status: query.status });
        }
        if (query.keyword?.trim()) {
            const keyword = `%${query.keyword.trim()}%`;
            builder.andWhere('(project.name LIKE :keyword OR project.keyCode LIKE :keyword)', { keyword });
        }
        const [items, total] = await builder
            .orderBy('project.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { items, total, page, limit };
    }
    findActiveForAutomaticReports(reportDate) {
        return this.repository
            .createQueryBuilder('project')
            .where('project.status = :status', { status: project_status_enum_1.ProjectStatus.Active })
            .andWhere('project.deletedAt IS NULL')
            .andWhere('(project.startDate IS NULL OR project.startDate <= :reportDate)', {
            reportDate,
        })
            .andWhere('(project.endDate IS NULL OR project.endDate >= :reportDate)', {
            reportDate,
        })
            .orderBy('project.createdAt', 'ASC')
            .getMany();
    }
    async update(project, data) {
        Object.assign(project, data);
        return this.repository.save(project);
    }
    async archive(project) {
        await this.repository.update(project.id, {
            status: project_status_enum_1.ProjectStatus.Archived,
        });
    }
    async complete(project) {
        await this.repository.update(project.id, {
            status: project_status_enum_1.ProjectStatus.Completed,
        });
    }
};
exports.ProjectsRepository = ProjectsRepository;
exports.ProjectsRepository = ProjectsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectsRepository);
//# sourceMappingURL=projects.repository.js.map