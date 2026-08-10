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
const get_tasks_query_dto_1 = require("../dto/get-tasks-query.dto");
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
        const builder = this.withDependencyState(this.repository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.assignee', 'assignee')
            .leftJoinAndSelect('task.creator', 'creator')
            .leftJoinAndSelect('task.sprint', 'sprint')
            .where('task.projectId = :projectId', { projectId })
            .andWhere('task.deletedAt IS NULL'));
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
        if (query.keyword?.trim()) {
            const keyword = `%${query.keyword.trim()}%`;
            builder.andWhere('(task.title LIKE :keyword OR task.taskCode LIKE :keyword)', { keyword });
        }
        if (query.dependencyState === get_tasks_query_dto_1.TaskDependencyStateFilter.Blocked) {
            builder.andWhere(this.blockedExistsSql('task'));
        }
        else if (query.dependencyState === get_tasks_query_dto_1.TaskDependencyStateFilter.Blocking) {
            builder.andWhere(this.blockingExistsSql('task'));
        }
        const total = await builder.getCount();
        const result = await builder
            .orderBy('task.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getRawAndEntities();
        const items = this.attachDependencyState(result.entities, result.raw);
        return { items, total, page, limit };
    }
    async findBacklogByProject(projectId) {
        const result = await this.withDependencyState(this.repository.createQueryBuilder('task'))
            .leftJoinAndSelect('task.assignee', 'assignee').leftJoinAndSelect('task.creator', 'creator')
            .where('task.projectId = :projectId', { projectId }).andWhere('task.sprintId IS NULL')
            .andWhere('task.status != :cancelled', { cancelled: task_status_enum_1.TaskStatus.Cancelled }).andWhere('task.deletedAt IS NULL')
            .orderBy('task.createdAt', 'DESC').getRawAndEntities();
        return this.attachDependencyState(result.entities, result.raw);
    }
    async findBySprint(projectId, sprintId) {
        const result = await this.withDependencyState(this.repository.createQueryBuilder('task'))
            .leftJoinAndSelect('task.assignee', 'assignee').leftJoinAndSelect('task.creator', 'creator')
            .where('task.projectId = :projectId', { projectId }).andWhere('task.sprintId = :sprintId', { sprintId })
            .andWhere('task.deletedAt IS NULL').orderBy('task.createdAt', 'DESC').getRawAndEntities();
        return this.attachDependencyState(result.entities, result.raw);
    }
    async update(task, data) {
        Object.assign(task, data);
        return this.repository.save(task);
    }
    findDueNotificationCandidates(throughDate) {
        return this.repository.createQueryBuilder('task')
            .innerJoinAndSelect('task.project', 'project')
            .where('task.deletedAt IS NULL')
            .andWhere('task.assigneeId IS NOT NULL')
            .andWhere('task.dueDate IS NOT NULL')
            .andWhere('task.dueDate <= :throughDate', { throughDate })
            .andWhere('task.status NOT IN (:...closedStatuses)', {
            closedStatuses: [task_status_enum_1.TaskStatus.Done, task_status_enum_1.TaskStatus.Cancelled],
        })
            .getMany();
    }
    softDelete(task) {
        return this.repository.softRemove(task);
    }
    withDependencyState(builder) {
        return builder
            .addSelect(`CASE WHEN ${this.blockedExistsSql('task')} THEN 1 ELSE 0 END`, 'task_isBlocked')
            .addSelect(`CASE WHEN ${this.blockingExistsSql('task')} THEN 1 ELSE 0 END`, 'task_isBlocking');
    }
    blockedExistsSql(alias) {
        return `EXISTS (SELECT 1 FROM task_dependencies dependency LEFT JOIN tasks source_task ON source_task.id = dependency.source_task_id LEFT JOIN tasks target_task ON target_task.id = dependency.target_task_id WHERE (dependency.type = 'DEPENDS_ON' AND dependency.source_task_id = ${alias}.id AND target_task.status != 'DONE') OR (dependency.type = 'BLOCKS' AND dependency.target_task_id = ${alias}.id AND source_task.status != 'DONE'))`;
    }
    blockingExistsSql(alias) {
        return `EXISTS (SELECT 1 FROM task_dependencies dependency LEFT JOIN tasks source_task ON source_task.id = dependency.source_task_id LEFT JOIN tasks target_task ON target_task.id = dependency.target_task_id WHERE (dependency.type = 'BLOCKS' AND dependency.source_task_id = ${alias}.id AND target_task.status != 'DONE') OR (dependency.type = 'DEPENDS_ON' AND dependency.target_task_id = ${alias}.id AND source_task.status != 'DONE'))`;
    }
    attachDependencyState(items, raw) {
        return items.map((task, index) => {
            task.isBlocked = Number(raw[index]?.task_isBlocked ?? 0) === 1;
            task.isBlocking = Number(raw[index]?.task_isBlocking ?? 0) === 1;
            return task;
        });
    }
};
exports.TasksRepository = TasksRepository;
exports.TasksRepository = TasksRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksRepository);
//# sourceMappingURL=tasks.repository.js.map