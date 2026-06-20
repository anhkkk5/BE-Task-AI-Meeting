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
exports.SprintsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sprint_status_enum_1 = require("../../../common/enums/sprint-status.enum");
const sprint_entity_1 = require("../entities/sprint.entity");
let SprintsRepository = class SprintsRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        const sprint = this.repository.create({
            ...data,
            status: sprint_status_enum_1.SprintStatus.Planned,
            startedAt: null,
            completedAt: null,
        });
        return this.repository.save(sprint);
    }
    findByIdAndProject(sprintId, projectId) {
        return this.repository.findOne({
            where: {
                id: sprintId,
                projectId,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
        });
    }
    findActiveByProject(projectId) {
        return this.repository.findOne({
            where: {
                projectId,
                status: sprint_status_enum_1.SprintStatus.Active,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
        });
    }
    async findByProject(projectId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const builder = this.repository
            .createQueryBuilder('sprint')
            .where('sprint.projectId = :projectId', { projectId })
            .andWhere('sprint.deletedAt IS NULL');
        if (query.status) {
            builder.andWhere('sprint.status = :status', { status: query.status });
        }
        if (query.keyword?.trim()) {
            const keyword = `%${query.keyword.trim()}%`;
            builder.andWhere('(sprint.name LIKE :keyword OR sprint.goal LIKE :keyword)', { keyword });
        }
        const [items, total] = await builder
            .orderBy('sprint.startDate', 'ASC')
            .addOrderBy('sprint.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { items, total, page, limit };
    }
    async update(sprint, data) {
        Object.assign(sprint, data);
        return this.repository.save(sprint);
    }
};
exports.SprintsRepository = SprintsRepository;
exports.SprintsRepository = SprintsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sprint_entity_1.Sprint)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SprintsRepository);
//# sourceMappingURL=sprints.repository.js.map