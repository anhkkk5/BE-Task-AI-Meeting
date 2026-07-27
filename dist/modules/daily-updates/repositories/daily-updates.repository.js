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
exports.DailyUpdatesRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const daily_update_entity_1 = require("../entities/daily-update.entity");
let DailyUpdatesRepository = class DailyUpdatesRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        const dailyUpdate = this.repository.create(data);
        const savedDailyUpdate = await this.repository.save(dailyUpdate);
        return ((await this.findByIdAndProject(savedDailyUpdate.id, data.projectId)) ??
            savedDailyUpdate);
    }
    findDuplicate(workspaceId, projectId, userId, updateDate) {
        return this.repository.findOne({
            where: {
                workspaceId,
                projectId,
                userId,
                updateDate,
            },
            withDeleted: true,
        });
    }
    findByIdAndProject(dailyUpdateId, projectId) {
        return this.repository.findOne({
            where: {
                id: dailyUpdateId,
                projectId,
            },
            relations: {
                sprint: true,
                user: true,
                needHelpFrom: true,
            },
        });
    }
    findMy(projectId, userId, query) {
        return this.findByProject(projectId, query, { userId });
    }
    findTeam(projectId, query) {
        return this.findByProject(projectId, query, { userId: query.memberId });
    }
    async update(dailyUpdate, data) {
        Object.assign(dailyUpdate, data);
        const savedDailyUpdate = await this.repository.save(dailyUpdate);
        return ((await this.findByIdAndProject(savedDailyUpdate.id, dailyUpdate.projectId)) ?? savedDailyUpdate);
    }
    async archive(dailyUpdate) {
        await this.repository.softRemove(dailyUpdate);
    }
    async findByProject(projectId, query, options) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const builder = this.repository
            .createQueryBuilder('dailyUpdate')
            .leftJoinAndSelect('dailyUpdate.user', 'user')
            .leftJoinAndSelect('dailyUpdate.sprint', 'sprint')
            .leftJoinAndSelect('dailyUpdate.needHelpFrom', 'needHelpFrom')
            .where('dailyUpdate.projectId = :projectId', { projectId })
            .andWhere('dailyUpdate.deletedAt IS NULL');
        if (options.userId) {
            builder.andWhere('dailyUpdate.userId = :userId', {
                userId: options.userId,
            });
        }
        if (query.sprintId) {
            builder.andWhere('dailyUpdate.sprintId = :sprintId', {
                sprintId: query.sprintId,
            });
        }
        if (query.date) {
            builder.andWhere('dailyUpdate.updateDate = :date', {
                date: this.normalizeDate(query.date),
            });
        }
        else {
            if (query.fromDate) {
                builder.andWhere('dailyUpdate.updateDate >= :fromDate', {
                    fromDate: this.normalizeDate(query.fromDate),
                });
            }
            if (query.toDate) {
                builder.andWhere('dailyUpdate.updateDate <= :toDate', {
                    toDate: this.normalizeDate(query.toDate),
                });
            }
        }
        const [items, total] = await builder
            .orderBy('dailyUpdate.updateDate', 'DESC')
            .addOrderBy('dailyUpdate.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { items, total, page, limit };
    }
    normalizeDate(value) {
        return value.slice(0, 10);
    }
};
exports.DailyUpdatesRepository = DailyUpdatesRepository;
exports.DailyUpdatesRepository = DailyUpdatesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_update_entity_1.DailyUpdate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DailyUpdatesRepository);
//# sourceMappingURL=daily-updates.repository.js.map