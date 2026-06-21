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
exports.TasksRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
const task_entity_1 = require("../entities/task.entity");
let TasksRepository = class TasksRepository {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    create(data) {
        const task = this.repository.create(data);
        return this.repository.save(task);
    }
    countByProject(projectId) {
        return this.repository.count({
            where: {
                projectId,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
        });
    }
    findByIdAndProject(taskId, projectId) {
        return this.repository.findOne({
            where: {
                id: taskId,
                projectId,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
            relations: {
                assignee: true,
                creator: true,
                sprint: true,
            },
        });
    }
    async findByProject(projectId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const builder = this.repository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.assignee', 'assignee')
            .leftJoinAndSelect('task.creator', 'creator')
            .leftJoinAndSelect('task.sprint', 'sprint')
            .where('task.projectId = :projectId', { projectId })
            .andWhere('task.deletedAt IS NULL');
        if (query.sprintId) {
            builder.andWhere('task.sprintId = :sprintId', {
                sprintId: query.sprintId,
            });
        }
        if (query.status) {
            builder.andWhere('task.status = :status', { status: query.status });
        }
        if (query.assigneeId) {
            builder.andWhere('task.assigneeId = :assigneeId', {
                assigneeId: query.assigneeId,
            });
        }
        if (query.priority) {
            builder.andWhere('task.priority = :priority', {
                priority: query.priority,
            });
        }
        if (query.keyword?.trim()) {
            const keyword = `%${query.keyword.trim()}%`;
            builder.andWhere('(task.title LIKE :keyword OR task.taskCode LIKE :keyword)', { keyword });
        }
        const [items, total] = await builder
            .orderBy('task.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { items, total, page, limit };
    }
    async findBacklogByProject(projectId) {
        return this.repository.find({
            where: {
                projectId,
                sprintId: (0, typeorm_2.IsNull)(),
                status: (0, typeorm_2.Not)(task_status_enum_1.TaskStatus.Cancelled),
                deletedAt: (0, typeorm_2.IsNull)(),
            },
            relations: {
                assignee: true,
                creator: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async findBySprint(projectId, sprintId) {
        return this.repository.find({
            where: {
                projectId,
                sprintId,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
            relations: {
                assignee: true,
                creator: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async update(task, data) {
        Object.assign(task, data);
        return this.repository.save(task);
    }
};
exports.TasksRepository = TasksRepository;
exports.TasksRepository = TasksRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksRepository);
//# sourceMappingURL=tasks.repository.js.map